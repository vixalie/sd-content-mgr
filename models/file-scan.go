package models

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"archgrid.xyz/ag/toolsbox/hash/crc32"
	"archgrid.xyz/ag/toolsbox/hash/sha256"
	"archgrid.xyz/ag/toolsbox/serialize/hex"
	"github.com/samber/lo"
	"github.com/vixalie/sd-content-manager/config"
	"github.com/vixalie/sd-content-manager/db"
	"github.com/vixalie/sd-content-manager/entities"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.org/x/sync/semaphore"
)

type SimpleModelDescript struct {
	Name           string  `json:"name"`
	VersionName    string  `json:"versionName"`
	FilePath       string  `json:"filePath"`
	Type           *string `json:"type"`
	ThumbnailPath  *string `json:"thumbnailPath"`
	FileHash       string  `json:"fileHash"`
	Related        bool    `json:"related"`
	RelatedModel   *int    `json:"relatedModel"`
	RelatedVersion *int    `json:"relatedVersion"`
}

var modelExts = []string{".safetensors", ".pt", ".pth", ".pickle"}

func scanModelFiles(ctx context.Context, software, model, subdir, keyword string) ([]SimpleModelDescript, error) {
	var (
		files         []string              = make([]string, 0)
		descriptions  []SimpleModelDescript = make([]SimpleModelDescript, 0)
		targetScanDir []string
	)
	switch config.MatchSoftware(software) {
	case config.ComfyUI:
		targetScanDir, _ = config.GetComfyModelPath(model)
	case config.WebUI:
		targetScanDir, _ = config.GetWebUIModelPath(model)
	}
	for _, targerDir := range targetScanDir {
		if len(targerDir) == 0 {
			continue
		}
		scanTarget := filepath.Join(targerDir, subdir)
		subItems, err := os.ReadDir(scanTarget)
		if err != nil {
			return descriptions, fmt.Errorf("扫描指定模型目录出错，%w", err)
		}
		for _, item := range subItems {
			if item.IsDir() {
				continue
			}
			loweredExt := strings.ToLower(filepath.Ext(item.Name()))
			if lo.Contains(modelExts, loweredExt) {
				files = append(files, filepath.Join(scanTarget, item.Name()))
			}
		}
	}
	// 检索全部数据库中未保存过的文件
	uncachedFiles, err := searchUncachedFiles(ctx, files)
	if err != nil {
		return descriptions, fmt.Errorf("查询未缓存文件出错，%w", err)
	}
	// 如果存在数据库中未保存的文件，那么就需要对这些文件进行扫描处理
	if len(uncachedFiles) > 0 {
		runtime.EventsEmit(ctx, "scanUncachedFiles", map[string]any{"state": "start", "amount": len(uncachedFiles)})
		var semaphore = semaphore.NewWeighted(10)
		// 扫描并解析其伴随文件
		for _, uncachedFile := range uncachedFiles {
			if err := semaphore.Acquire(ctx, 1); err != nil {
				return descriptions, fmt.Errorf("扫描控制过程失败，无法继续处理未扫描模型文件，%w", err)
			}
			go scanModelFile(&ctx, semaphore, uncachedFile)
		}
		// 未完成扫描的文件同样记录进入数据库，但不提供任何对应的模型信息。
		runtime.EventsEmit(ctx, "scanUncachedFiles", map[string]any{"state": "finish"})
	}
	// 重新从数据库检索全部列举到的文件。
	descriptions, err = searchModelInfo(ctx, files)
	if err != nil {
		return descriptions, fmt.Errorf("查询模型信息出错，%w", err)
	}
	// 对文件列表使用关键词过滤，保留文件名和模型名称中包含关键词的文件。
	descriptions = lo.Filter(descriptions, func(item SimpleModelDescript, _ int) bool {
		fileName := filepath.Base(item.FilePath)
		return strings.Contains(item.Name, keyword) || strings.Contains(fileName, keyword)
	})
	return descriptions, nil
}

// 注意本函数会运行在独立的协程中，不要返回任何错误，每次也应该值处理一个文件或者一个模型。
func scanModelFile(ctx *context.Context, weighted *semaphore.Weighted, filePath string) {
	defer runtime.EventsEmit(*ctx, "scanUncachedFiles", map[string]any{"state": "progress", "amount": 1})
	defer weighted.Release(1)
	thumbnailPath, descriptionPath, err := collectAccompanyFile(filePath)
	if err != nil {
		runtime.EventsEmit(*ctx, "scanUncachedFiles", map[string]any{"state": "error", "message": "未找到模型对应的Civitai Info文件和缩略图文件。", "error": err.Error()})
		return
	}
	fileBaseName := filepath.Base(filePath)
	fileHash, err := sha256.SumFile256Hex(filePath)
	if err != nil {
		runtime.EventsEmit(*ctx, "scanUncachedFiles", map[string]any{"state": "error", "message": "未能成功计算模型文件Hash校验值。", "error": err.Error()})
		return
	}
	fileCrc32, err := crc32.SumFile(filePath)
	if err != nil {
		runtime.EventsEmit(*ctx, "scanUncachedFiles", map[string]any{"state": "error", "message": "未能成功计算模型文件CRC32校验值。", "error": err.Error()})
		return
	}
	var modelDescription *ModelVersion
	if descriptionPath != nil {
		// 这里处理的是Civitai Info文件已经被发现的情形。
		modelInfoFileContent, err := os.ReadFile(*descriptionPath)
		if err != nil {
			runtime.EventsEmit(*ctx, "scanUncachedFiles", map[string]any{"state": "error", "message": "未能打开模型Civitai Info文件。", "error": err.Error()})
			goto TERMINATE_PARSE
		}
		err = parseCivitaiModelVersionResponse(modelInfoFileContent)
		if err != nil {
			runtime.EventsEmit(*ctx, "scanUncachedFiles", map[string]any{"state": "error", "message": "未能解析模型Civitai Info文件。", "error": err.Error()})
			goto TERMINATE_PARSE
		}
		// 这里继续保存从模型Version中可以提取的各种信息。
	}
TERMINATE_PARSE:
	// 处理实际的文件信息，将文件保存到数据库的FileCache中。
	fileInfo, _ := os.Stat(filePath)
	fileCache := entities.FileCache{
		FileIdentityHash: fileHash,
		FileName:         fileBaseName,
		FullPath:         filePath,
		ThumbnailPath:    thumbnailPath,
		CivitaiInfoPath:  descriptionPath,
		Size:             uint64(fileInfo.Size()),
		CRC32:            strings.ToUpper(hex.ToHex(lo.Reverse(fileCrc32))), // 这里需要转换成小端序，还需要转换成大写形式。
	}
	if modelDescription != nil {
		// 当模型描述不等于空的时候，需要向文件中登记其对应的模型信息。
		fileCache.RelatedModelVersionId = &modelDescription.Id
	}
	db.CacheDB.Create(&fileCache)
}

// 返回值分别为伴随模型的缩略图路径和Civitai描述文件路径。需要传入的模型文件路径为绝对路径。如果模型没有对应的缩略图或描述文件，则返回nil。
// 如果发现了多个对应的文件，则会返回最后发现的文件。
func collectAccompanyFile(modelFilePath string) (*string, *string, error) {
	modelFile, err := os.Stat(modelFilePath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil, fmt.Errorf("模型文件不存在")
		}
		return nil, nil, fmt.Errorf("获取模型文件信息出错，%w", err)
	}
	modelDir := filepath.Dir(modelFilePath)
	modelFileName := modelFile.Name()
	var (
		thumbnailPath   *string
		descriptionPath *string
	)
	files, err := os.ReadDir(modelDir)
	if err != nil {
		return nil, nil, fmt.Errorf("获取模型文件所在目录文件列表出错，%w", err)
	}
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		fileName := strings.ToLower(file.Name())
		if strings.HasPrefix(fileName, modelFileName) {
			if strings.HasSuffix(fileName, ".png") || strings.HasSuffix(fileName, ".jpg") {
				absPath := filepath.Join(modelDir, file.Name())
				thumbnailPath = &absPath
			} else if strings.HasSuffix(file.Name(), ".civitai.info") {
				absPath := filepath.Join(modelDir, file.Name())
				descriptionPath = &absPath
			}
		}
	}
	return thumbnailPath, descriptionPath, nil
}

// 对于文件是否是已经保存在数据库中的判断，是使用文件的完整绝对路径来实现的，因此，如果文件移动了位置，那么就会导致文件无法被正确识别。
func searchUncachedFiles(ctx context.Context, files []string) ([]string, error) {
	var (
		uncachedFilePathes []string = make([]string, 0)
	)
	fileGroups := lo.Chunk(files, 50)
	for _, fileGroup := range fileGroups {
		uncachedFiles := make([]entities.FileCache, 0)
		db.CacheDB.Not("fullpath IN ?", fileGroup).Find(&uncachedFiles)
		for _, filePath := range uncachedFiles {
			uncachedFilePathes = append(uncachedFilePathes, filePath.FullPath)
		}
	}

	return uncachedFilePathes, nil
}

// 重新从数据库按照遍历得到的文件检索模型信息。
func searchModelInfo(ctx context.Context, files []string) ([]SimpleModelDescript, error) {
	var (
		descriptions []SimpleModelDescript = make([]SimpleModelDescript, 0)
	)
	fileGroups := lo.Chunk(files, 50)
	for _, fileGroup := range fileGroups {
		fileCache := make([]entities.FileCache, 0)
		db.CacheDB.Where("fullpath IN ?", fileGroup).Find(&fileCache)
		for _, cache := range fileCache {
			var (
				relatedModel *int
				modelName    string
				versionName  string
				modelType    *string
			)
			if cache.RelatedModelVersionId != nil {
				modelName = cache.RelatedModel.Model.Name
				versionName = cache.RelatedModel.VersionName
				relatedModel = &cache.RelatedModel.Model.Id
				modelType = &cache.RelatedModel.Model.Type
			} else {
				modelName = filepath.Base(cache.FullPath)
				versionName = ""
			}
			description := SimpleModelDescript{
				Name:           modelName,
				VersionName:    versionName,
				FilePath:       cache.FullPath,
				Type:           modelType,
				ThumbnailPath:  cache.ThumbnailPath,
				FileHash:       cache.FileIdentityHash,
				Related:        cache.RelatedModelVersionId != nil,
				RelatedModel:   relatedModel,
				RelatedVersion: cache.RelatedModelVersionId,
			}
			descriptions = append(descriptions, description)
		}
	}
	return descriptions, nil
}