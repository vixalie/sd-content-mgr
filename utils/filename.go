package utils

import (
	"path/filepath"
	"strings"
)

// 拆解文件名，返回文件名和扩展名
func BreakFilename(filename string) (string, string) {
	name := filepath.Base(filename)
	ext := filepath.Ext(name)
	bareName := strings.TrimSuffix(name, ext)
	return bareName, ext
}
