package models

import (
	"context"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"sync"

	"archgrid.xyz/ag/toolsbox/hash/crc32"
	"archgrid.xyz/ag/toolsbox/hash/sha256"
	"archgrid.xyz/ag/toolsbox/serial_code/hail"
	"archgrid.xyz/ag/toolsbox/serialize/hex"
	"github.com/samber/lo"
	"github.com/vixalie/sd-content-manager/config"
	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/entities"
	"github.com/vixalie/sd-content-manager/utils"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/sync/semaphore"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var (
	scanableModelTypes = []string{"checkpoint", "hypernet", "embedding", "lora", "locon", "vae", "controlnet", "upscaler"}
)

func fullScanEverything(ctx context.Context) error {
	for _, uiTool := range []string{"comfyui", "webui"} {
		runtime.LogDebugf(ctx, "正在扫描: %s\n", uiTool)
		err := scanSoftware(ctx, uiTool)
		if err != nil {
			return err
		}
	}
	return nil
}

func scanSoftware(ctx context.Context, uiTools string) error {
	for _, modelType := range scanableModelTypes {
		runtime.LogDebugf(ctx, "正在扫描: [%s] %s", uiTools, modelType)
		err := scanModel(ctx, uiTools, modelType)
		if err != nil {
			runtime.LogErrorf(ctx, "扫描指定类型模型目录出错，%s", err)
			return fmt.Errorf("扫描指定类型模型目录出错，%w", err)
		}
	}
	return nil
}

func scanModel(ctx context.Context, uiTools, modelType string) error {
	var targetScanDir []string
	switch config.MatchSoftware(uiTools) {
	case config.ComfyUI:
		targetScanDir, _ = config.GetComfyModelPath(modelType)
	case config.WebUI:
		targetScanDir, _ = config.GetWebUIModelPath(modelType)
	}
	var (
		scanQueue = make(chan string, 500)
		semaphore = semaphore.NewWeighted(10)
		wg        sync.WaitGroup
	)
	go scanDir(scanQueue, targetScanDir)
	for dir := range scanQueue {
		runtime.LogDebugf(ctx, "正在扫描文件：[%s][%s] %s", uiTools, modelType, dir)
		if err := semaphore.Acquire(ctx, 1); err != nil {
			runtime.LogErrorf(ctx, "无法执行扫描过程控制，%s", err)
			return fmt.Errorf("无法执行扫描过程控制，%w", err)
		}
		wg.Add(1)
		// 调用简易模型扫描函数，放入文件的绝对路径
		go simplifiedScanModelFiles(ctx, semaphore, &wg, modelType, dir)
	}
	wg.Wait()
	return nil
}

func scanDir(queue chan string, targetDirs []string) {
	for _, dir := range targetDirs {
		// 扫描指定目录下的所有子目录，将所有的子目录都放入扫描队列中，将对所有的文件调用模型扫描函数
		entries, err := os.ReadDir(dir)
		if err != nil {
			return
		}
		for _, entry := range entries {
			filepath.WalkDir(filepath.Join(dir, entry.Name()), func(path string, d fs.DirEntry, err error) error {
				if !d.IsDir() {
					fileExt := strings.ToLower(filepath.Ext(d.Name()))
					if lo.Contains(modelExts, fileExt) {
						queue <- path
					}
				}
				return nil
			})
		}
	}
	close(queue)
}

func simplifiedScanModelFiles(ctx context.Context, weighted *semaphore.Weighted, wg *sync.WaitGroup, modelType, targetFilePath string) {
	defer weighted.Release(1)
	defer wg.Done()
	defer runtime.EventsEmit(ctx, "mass-scan-file", map[string]string{"state": "end", "file": targetFilePath})
	runtime.LogDebugf(ctx, "Scanning model: [%s] %s", modelType, targetFilePath)

	runtime.EventsEmit(ctx, "mass-scan-file", map[string]string{"state": "start", "file": targetFilePath})

	fileHash, err := sha256.SumFile256Hex(targetFilePath)
	if err != nil {
		runtime.EventsEmit(ctx, "mass-scan-file", map[string]string{"state": "error", "file": targetFilePath, "message": "无法计算文件哈希值"})
		runtime.LogErrorf(ctx, "计算文件哈希值失败，%s", err)
		return
	}
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)

	// 根据文件Hash检查文件是否已经被记录过了
	var count int64
	result := dbConn.Model(&entities.FileCache{}).Where("file_identity_hash = ?", fileHash).Count(&count)
	if result.Error != nil {
		runtime.EventsEmit(ctx, "mass-scan-file", map[string]string{"state": "error", "file": targetFilePath, "message": "无法查询文件是否已经被记录"})
		runtime.LogErrorf(ctx, "查询文件是否已经被记录失败，%s", result.Error)
		return
	}
	if count > 0 {
		runtime.EventsEmit(ctx, "mass-scan-file", map[string]string{"state": "skip", "file": targetFilePath, "message": "文件已经被记录"})
		runtime.LogInfof(ctx, "文件 [%s] 已经被记录，跳过", targetFilePath)
		return
	}

	// 收集所有扫描文件和模型信息需要的陪同文件
	thumbnailPath, descriptionPath, err := collectAccompanyFile(targetFilePath)
	if err != nil {
		runtime.EventsEmit(ctx, "mass-scan-file", map[string]string{"state": "error", "file": targetFilePath, "message": "无法收集文件陪同文件"})
		runtime.LogErrorf(ctx, "收集文件 [%s] 陪同文件失败，%s", targetFilePath, err)
		return
	}
	var thumbnailHash *string
	if thumbnailPath != nil {
		hash, err := utils.PHashImage(*thumbnailPath)
		if err != nil {
			runtime.EventsEmit(ctx, "mass-scan-file", map[string]string{"state": "error", "file": targetFilePath, "message": "无法计算文件缩略图哈希值"})
			runtime.LogErrorf(ctx, "计算文件 [%s] 缩略图哈希值失败，%s", targetFilePath, err)
			return
		}
		thumbnailHash = &hash
	}
	fileBaseName := filepath.Base(targetFilePath)
	fileCrc32, err := crc32.SumFile(targetFilePath)
	if err != nil {
		runtime.EventsEmit(ctx, "mass-scan-file", map[string]string{"state": "error", "file": targetFilePath, "message": "无法计算文件CRC32值"})
		runtime.LogErrorf(ctx, "计算文件 [%s] CRC32 值失败，%s", targetFilePath, err)
		return
	}
	var modelDescription *ModelVersion
	if descriptionPath != nil {
		// 这里处理的是Civitai Info文件已经被发现的情形。
		modelInfoFileContent, err := os.ReadFile(*descriptionPath)
		if err != nil {
			runtime.EventsEmit(ctx, "mass-scan-file", map[string]string{"state": "error", "file": targetFilePath, "message": "无法读取模型Civitai Info文件"})
			runtime.LogErrorf(ctx, "读取模型Civitai Info文件失败，%s", err)
			goto TERMINATE_PARSE
		}
		modelDescription, err = ParseCivitaiModelVersionResponse(ctx, modelInfoFileContent)
		if err != nil {
			runtime.EventsEmit(ctx, "mass-scan-file", map[string]string{"state": "error", "file": targetFilePath, "message": "无法解析模型Civitai Info文件"})
			runtime.LogErrorf(ctx, "解析模型Civitai Info文件失败，%s", err)
			goto TERMINATE_PARSE
		}
		// 这里继续保存从模型Version中可以提取的各种信息。
	}
TERMINATE_PARSE:
	// 处理实际的文件信息，将文件保存到数据库的FileCache中。
	fileInfo, _ := os.Stat(targetFilePath)
	hail := ctx.Value("hail").(*hail.HailAlgorithm)
	fileCache := entities.FileCache{
		Id:               hail.GeneratePrefixedString("F"),
		FileIdentityHash: strings.ToUpper(fileHash),
		FileName:         fileBaseName,
		FullPath:         targetFilePath,
		ThumbnailPath:    thumbnailPath,
		ThumbnailPHash:   thumbnailHash,
		CivitaiInfoPath:  descriptionPath,
		Size:             uint64(fileInfo.Size()),
		CRC32:            strings.ToUpper(hex.ToHex(lo.Reverse(fileCrc32))), // 这里需要转换成小端序，还需要转换成大写形式。
	}
	if modelDescription != nil && modelDescription.Id != 0 {
		// 当模型描述不等于空的时候，需要向文件中登记其对应的模型信息。
		fileCache.RelatedModelVersionId = &modelDescription.Id
	}
	dbConn.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "file_identity_hash"}}, DoNothing: true}).Create(&fileCache)
	runtime.EventsEmit(ctx, "mass-scan-file", map[string]string{"state": "done", "file": targetFilePath})
}

type DuplicateFile struct {
	FilePath      string  `json:"filePath"`
	FileName      string  `json:"fileName"`
	ThumbnailPath *string `json:"thumbnailPath"`
	InfoPath      *string `json:"infoPath"`
	Hash          string  `json:"hash"`
	CacheId       *string `json:"cacheId"`
}

type DuplicateRecord struct {
	Model   *entities.Model        `json:"model"`
	Version *entities.ModelVersion `json:"version"`
	Hash    string                 `json:"hash"`
	Files   []DuplicateFile        `json:"files"`
}

func scanDuplicateModelFiles(ctx context.Context) ([]DuplicateRecord, error) {
	var (
		duplicates = make(map[string][]string, 0)
		allDirs    = make([]string, 0)
		scanQueue  = make(chan string, 500)
	)
	// 缓存需要扫描的初始目录集合
	for _, ui := range []string{"comfyui", "webui"} {
		for _, modelType := range scanableModelTypes {
			var targetScanDir []string
			switch config.MatchSoftware(ui) {
			case config.ComfyUI:
				targetScanDir, _ = config.GetComfyModelPath(modelType)
			case config.WebUI:
				targetScanDir, _ = config.GetWebUIModelPath(modelType)
			}
			allDirs = append(allDirs, targetScanDir...)
		}
	}
	go scanDir(scanQueue, allDirs)
	// 开始扫描
	for dir := range scanQueue {
		fileHash, err := sha256.SumFile256Hex(dir)
		if err != nil {
			runtime.LogErrorf(ctx, "计算文件 [%s] 哈希值失败，%s", dir, err)
			continue
		}
		if _, ok := duplicates[fileHash]; !ok {
			duplicates[fileHash] = []string{dir}
		} else {
			duplicates[fileHash] = append(duplicates[fileHash], dir)
		}
	}
	// 合成重复文件记录
	var duplicateRecords = make([]DuplicateRecord, 0)
	dbConn := ctx.Value(db.DBConnection).(*gorm.DB)
	for hash, files := range duplicates {
		// 检索Hash重复的各个文件的信息，形成DuplicateFile记录
		duplicatedFiles := lo.Map(files, func(file string, _ int) DuplicateFile {
			fileRecord := DuplicateFile{
				FilePath: file,
				FileName: filepath.Base(file),
				Hash:     hash,
			}
			thumbnailPath, descriptionPath, _ := collectAccompanyFile(file)
			fileRecord.ThumbnailPath = thumbnailPath
			fileRecord.InfoPath = descriptionPath

			var cacheRecord entities.FileCache
			result := dbConn.Model(&entities.FileCache{}).Where("full_path = ?", file).First(&cacheRecord)
			if !errors.Is(result.Error, gorm.ErrRecordNotFound) || result.Error == nil {
				fileRecord.CacheId = &cacheRecord.Id
			}

			return fileRecord
		})
		record := DuplicateRecord{
			Hash:  hash,
			Files: duplicatedFiles,
		}
		// 检索文件对应的Model和ModelVersion信息，并合成
		var file entities.ModelFile
		result := dbConn.Preload("Version").Preload("Version.Files").Where("identity_hash = ?", strings.ToUpper(hash)).First(&file)
		if !errors.Is(result.Error, gorm.ErrRecordNotFound) || result.Error == nil {
			record.Model = file.Version.Model
			record.Version = file.Version
		}
		if len(record.Files) > 1 {
			duplicateRecords = append(duplicateRecords, record)
		}
	}
	return duplicateRecords, nil
}
