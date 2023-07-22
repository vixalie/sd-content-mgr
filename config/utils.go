package config

import (
	"path/filepath"
	"strings"
)

func IsSubDir(basePath, targetPath string) bool {
	relativePath, err := filepath.Rel(basePath, targetPath)
	if err != nil {
		return false
	}
	return relativePath != "." && !strings.HasPrefix(relativePath, "..")
}
