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

func (c *GitController) Branches(dir string) ([]string, error) {
	repo, status, err := OpenRepository(dir)
	switch status {
	case InvalidRepository, InvalidRemote, InvalidBranch:
		runtime.LogErrorf(c.ctx, "打开指定目录中的Git版本库失败，%s", err.Error())
		return nil, c.checkStatus(status)
	}
	if err != nil {
		return nil, fmt.Errorf("打开指定目录中的Git版本库失败，%w", err)
	}
	branches, operStatus, err := repo.Branches()
	if operStatus == Failed || err != nil {
		return nil, fmt.Errorf("获取Git版本库的分支列表失败，%w", err)
	}
	return branches, nil
}

// 这个方法返回的布尔值所表达的含义需要根据其返回的错误来判断。如果返回的错误是`nil`，那么布尔值表示是否有新的提交。如果返回的错误不是`nil`，那么布尔值表示是否成功。
func (c *GitController) Fetch(dir, remote string) (bool, error) {
	repo, status, err := OpenRepository(dir)
	switch status {
	case InvalidRepository, InvalidRemote, InvalidBranch:
		runtime.LogErrorf(c.ctx, "打开指定目录中的Git版本库失败，%s", err.Error())
		return false, c.checkStatus(status)
	}
	if err != nil {
		return false, fmt.Errorf("打开指定目录中的Git版本库失败，%w", err)
	}
	currentRemote, err := repo.CurrentRemote()
	if err != nil {
		return false, fmt.Errorf("获取Git版本库的当前远程仓库失败，%w", err)
	}
	if currentRemote != remote {
		status, err = repo.SetActiveRemote(remote)
		if status == InvalidRemote {
			runtime.LogErrorf(c.ctx, "设置Git版本库的活动远程仓库失败，%s", err.Error())
			return false, err
		}
	}
	status, err = repo.Fetch()
	if status == Failed {
		return false, err
	}
	if status == SuccessButNothingChanged {
		return false, nil
	}
	return true, nil
}

func (c *GitController) CheckDifference(dir, remote, branch string) (int64, error) {
	repo, status, err := OpenRepository(dir)
	runtime.LogDebugf(c.ctx, "检查版本库的更新情况：远程：%s，分支：%s", remote, branch)
	switch status {
	case InvalidRepository, InvalidRemote, InvalidBranch:
		runtime.LogErrorf(c.ctx, "打开指定目录中的Git版本库失败，%s", err.Error())
		return 0, c.checkStatus(status)
	}
	if err != nil {
		return 0, fmt.Errorf("打开指定目录中的Git版本库失败，%w", err)
	}
	currentRemote, err := repo.CurrentRemote()
	if err != nil {
		return 0, fmt.Errorf("获取Git版本库的当前远程仓库失败，%w", err)
	}
	if currentRemote != remote {
		status, err = repo.SetActiveRemote(remote)
		if status == InvalidRemote {
			runtime.LogErrorf(c.ctx, "设置Git版本库的活动远程仓库失败，%s", err.Error())
			return 0, err
		}
	}
	currentBranch, err := repo.CurrentBranch()
	if err != nil {
		return 0, fmt.Errorf("获取Git版本库的当前分支失败，%w", err)
	}
	if currentBranch.Short() != branch {
		status, err = repo.Checkout(branch)
		if status == InvalidBranch {
			runtime.LogErrorf(c.ctx, "设置Git版本库的活动分支失败，%s", err.Error())
			return 0, err
		}
	}
	difference, status, err := repo.Difference()
	if err != nil {
		return 0, fmt.Errorf("获取Git版本库的差异失败，%w", err)
	}
	switch status {
	case InvalidRemote:
		runtime.LogErrorf(c.ctx, "获取Git版本库的差异失败，%s", err.Error())
		return 0, err
	case InvalidBranch:
		runtime.LogErrorf(c.ctx, "获取Git版本库的差异失败，%s", err.Error())
		return 0, err
	case InvalidCommit:
		runtime.LogErrorf(c.ctx, "获取Git版本库的差异失败，%s", err.Error())
		return 0, err
	case Failed:
		runtime.LogErrorf(c.ctx, "获取Git版本库的差异失败，%s", err.Error())
		return 0, err
	}
	return difference, nil
}
