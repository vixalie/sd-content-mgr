package git

import (
	"context"
	"fmt"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type GitController struct {
	ctx context.Context
}

func NewGitController() *GitController {
	return &GitController{}
}

func (c *GitController) SetContext(ctx context.Context) {
	c.ctx = ctx
}

func (c *GitController) checkStatus(status RepositoryOperateStatus) error {
	switch status {
	case InvalidRepository:
		return fmt.Errorf("指定目录可能不是有效的Git版本库，无法使用升级功能")
	case InvalidRemote:
		return fmt.Errorf("指定目录中的Git版本库没有设置远程仓库，需要先设置远程仓库")
	case InvalidBranch:
		return fmt.Errorf("指定目录中的Git版本库没有找到主分支")
	}
	return nil
}

func (c *GitController) CurrentRemote(dir string) (string, error) {
	repo, status, err := OpenRepository(dir)
	switch status {
	case InvalidRepository, InvalidRemote, InvalidBranch:
		runtime.LogErrorf(c.ctx, "打开指定目录中的Git版本库失败，%s", err.Error())
		return "", c.checkStatus(status)
	}
	if err != nil {
		return "", fmt.Errorf("打开指定目录中的Git版本库失败，%w", err)
	}
	return repo.CurrentRemote()
}

func (c *GitController) Remotes(dir string) ([]string, error) {
	repo, status, err := OpenRepository(dir)
	switch status {
	case InvalidRepository, InvalidRemote, InvalidBranch:
		runtime.LogErrorf(c.ctx, "打开指定目录中的Git版本库失败，%s", err.Error())
		return nil, c.checkStatus(status)
	}
	if err != nil {
		return nil, fmt.Errorf("打开指定目录中的Git版本库失败，%w", err)
	}
	remotes, err := repo.Remotes()
	if err != nil {
		return nil, fmt.Errorf("获取Git版本库的远程仓库列表失败，%w", err)
	}
	return remotes, nil
}

func (c *GitController) CurrentBranch(dir string) (string, error) {
	repo, status, err := OpenRepository(dir)
	switch status {
	case InvalidRepository, InvalidRemote, InvalidBranch:
		runtime.LogErrorf(c.ctx, "打开指定目录中的Git版本库失败，%s", err.Error())
		return "", c.checkStatus(status)
	}
	if err != nil {
		return "", fmt.Errorf("打开指定目录中的Git版本库失败，%w", err)
	}
	branchName, err := repo.CurrentBranch()
	if err != nil {
		return "", fmt.Errorf("获取Git版本库的当前分支失败，%w", err)
	}
	return branchName.Short(), nil
}
