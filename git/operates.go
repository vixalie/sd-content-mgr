package git

import (
	"errors"
	"fmt"
	"io"
	"net/url"
	"os"
	"strings"

	"github.com/go-git/go-git/v5"
	gitconfig "github.com/go-git/go-git/v5/config"
	"github.com/go-git/go-git/v5/plumbing"
	"github.com/go-git/go-git/v5/plumbing/object"
	"github.com/go-git/go-git/v5/plumbing/transport"
	"github.com/go-git/go-git/v5/plumbing/transport/ssh"
	"github.com/mikkeloscar/sshconfig"
	"github.com/samber/lo"
	"github.com/vixalie/sd-content-manager/config"
)

type RepositoryOperateStatus int

const (
	Success RepositoryOperateStatus = iota
	SuccessButNothingChanged
	Failed
	InvalidRepository
	InvalidWorkTree
	InvalidRemote
	InvalidBranch
	InvalidReference
	InvalidCommit
)

type GitRepository struct {
	authKeys     map[string]*sshconfig.SSHHost
	Repository   *git.Repository
	activeRemote *git.Remote
	activeBranch *plumbing.ReferenceName
	worktree     *git.Worktree
}

func OpenRepository(dirPath string, keys map[string]*sshconfig.SSHHost) (*GitRepository, RepositoryOperateStatus, error) {
	repo, err := git.PlainOpen(dirPath)
	if errors.Is(err, git.ErrRepositoryNotExists) {
		return nil, InvalidRepository, fmt.Errorf("指定目录中未找到Git版本库")
	}
	if err != nil {
		return nil, InvalidRepository, fmt.Errorf("未能打开指定目录中的Git版本库，%w", err)
	}
	// 获取版本库的默认远程，会首先查找名为origin的远程，如果没有找到，则返回第一个远程。
	var primaryRemote *git.Remote
	primaryRemote, err = repo.Remote("origin")
	if err != nil {
		remotes, err := repo.Remotes()
		if err != nil {
			return nil, InvalidRepository, fmt.Errorf("未能获取版本库的远程列表，%w", err)
		}
		if len(remotes) > 0 {
			primaryRemote = remotes[0]
		} else {
			return nil, InvalidRemote, fmt.Errorf("必须首先设置版本库的远程仓库")
		}
	}

	// 检查版本库的主分支，保存主分支的名称。
	headRef, err := repo.Head()
	if err != nil {
		return nil, InvalidReference, fmt.Errorf("未能获取版本库的HEAD引用，%w", err)
	}
	branchName := headRef.Name()

	// 获取版本库当前的工作树。
	workTree, err := repo.Worktree()
	if err != nil {
		return nil, InvalidWorkTree, fmt.Errorf("未能获取指定目录中的Git版本库工作树，%w", err)
	}

	return &GitRepository{
		authKeys:     keys,
		Repository:   repo,
		activeRemote: primaryRemote,
		activeBranch: &branchName,
		worktree:     workTree,
	}, Success, nil
}

func assembleProxyOptions() transport.ProxyOptions {
	url := config.GetProxyUrl()
	return lo.If(url != nil, transport.ProxyOptions{URL: url.String()}).Else(transport.ProxyOptions{})
}

func getHostFromSSHURL(sshURL string) string {
	sshURL = strings.Replace(sshURL, ":", "/", 1)
	// 添加协议前缀
	sshURL = "ssh://" + sshURL

	// 解析URL
	parsedURL, err := url.Parse(sshURL)
	if err != nil {
		fmt.Printf("无法解析SSH URL：%v\n", err)
		return ""
	}

	// 获取主机地址
	host := parsedURL.Hostname()

	return host
}

func loadSSHAuthKeys(url string, keys map[string]*sshconfig.SSHHost) transport.AuthMethod {
	if strings.HasPrefix(url, "git@") {
		host := getHostFromSSHURL(url)
		if sshConfig, ok := keys[host]; ok {
			homeDir, err := os.UserHomeDir()
			if err != nil {
				fmt.Printf("无法获取当前用户的主目录：%v\n", err)
				return nil
			}
			identityFile := strings.Replace(sshConfig.IdentityFile, "~", homeDir, 1)
			prikey, err := os.ReadFile(identityFile)
			if err != nil {
				fmt.Printf("无法加载 SSH 私钥：%v\n", err)
				return nil
			}
			pubKey, err := ssh.NewPublicKeys(sshConfig.User, prikey, "")
			if err != nil {
				fmt.Printf("无法加载SSH密钥：%v\n", err)
				return nil
			}
			fmt.Printf("成功加载SSH密钥：%s\n", identityFile)
			return pubKey
		}
	}
	return nil
}

func (r *GitRepository) MakeSurePrimaryBranch() (string, RepositoryOperateStatus, error) {
	if r.activeRemote == nil {
		return "", InvalidRemote, fmt.Errorf("未设置活动远程仓库")
	}
	remote, err := r.Repository.Remote(r.activeRemote.Config().Name)
	if err != nil {
		return "", InvalidRemote, fmt.Errorf("未能获取指定名称的远程仓库，%w", err)
	}
	refs, err := remote.List(&git.ListOptions{
		ProxyOptions: assembleProxyOptions(),
	})
	if err != nil {
		return "", Failed, fmt.Errorf("未能获取远程仓库引用列表，%w", err)
	}
	var mainBranch plumbing.ReferenceName
	for _, ref := range refs {
		if ref.Name().IsBranch() && (ref.Name().Short() == "main" || ref.Name().Short() == "master") {
			mainBranch = ref.Name()
			break
		}
	}
	return string(mainBranch), Success, nil
}

func (r *GitRepository) Fetch() (RepositoryOperateStatus, error) {
	if r.activeRemote == nil {
		return InvalidRemote, fmt.Errorf("未设置活动远程仓库")
	}
	err := r.Repository.Fetch(&git.FetchOptions{
		RemoteName:   r.activeRemote.Config().Name,
		ProxyOptions: assembleProxyOptions(),
		Auth:         loadSSHAuthKeys(r.activeRemote.Config().URLs[0], r.authKeys),
	})
	if errors.Is(err, git.NoErrAlreadyUpToDate) {
		return SuccessButNothingChanged, nil
	}
	if err != nil && !errors.Is(err, git.NoErrAlreadyUpToDate) {
		return Failed, fmt.Errorf("未能从远程仓库获取最新版本信息，%w", err)
	}
	return Success, nil
}

func (r *GitRepository) Difference() (int64, RepositoryOperateStatus, error) {
	// 获取远程最新的提交。
	remoteRefs, err := r.activeRemote.List(&git.ListOptions{
		ProxyOptions: assembleProxyOptions(),
		Auth:         loadSSHAuthKeys(r.activeRemote.Config().URLs[0], r.authKeys),
	})
	if err != nil {
		return 0, InvalidRemote, fmt.Errorf("未能获取远程仓库引用列表，%w", err)
	}
	var masterRef *plumbing.Reference
	for _, ref := range remoteRefs {
		if ref.Name().IsBranch() && ref.Name() == *r.activeBranch {
			masterRef = ref
			break
		}
	}
	remoteCommits, err := r.Repository.Log(&git.LogOptions{
		From:  masterRef.Hash(),
		Order: git.LogOrderCommitterTime,
	})
	if err != nil {
		return 0, InvalidCommit, fmt.Errorf("未能获取远程分支的提交记录，%w", err)
	}

	// 获取本地最新的提交。
	localRefs, err := r.Repository.Reference(*r.activeBranch, true)
	if err != nil {
		return 0, InvalidBranch, fmt.Errorf("未能获取本地分支引用，%w", err)
	}
	localCommits, err := r.Repository.Log(&git.LogOptions{
		From:  localRefs.Hash(),
		Order: git.LogOrderCommitterTime,
	})
	if err != nil {
		return 0, InvalidCommit, fmt.Errorf("未能获取本地分支的提交记录，%w", err)
	}

	// 计算两个提交之间的差异。
	var difference int64 = 0
	localCommits.ForEach(func(commit *object.Commit) error {
		found := false
		remoteCommits.ForEach(func(remoteCommit *object.Commit) error {
			if commit.Hash == remoteCommit.Hash {
				found = true
				return io.EOF
			}
			difference++
			return nil
		})
		if found {
			return io.EOF
		}
		return nil
	})

	return difference, Success, nil
}

func (r *GitRepository) Pull() (RepositoryOperateStatus, error) {
	if r.activeRemote == nil {
		return InvalidRemote, fmt.Errorf("未设置活动远程仓库")
	}
	err := r.worktree.Pull(&git.PullOptions{
		RemoteName:   r.activeRemote.Config().Name,
		ProxyOptions: assembleProxyOptions(),
		Auth:         loadSSHAuthKeys(r.activeRemote.Config().URLs[0], r.authKeys),
	})
	if errors.Is(err, git.NoErrAlreadyUpToDate) {
		return SuccessButNothingChanged, nil
	}
	if err != nil && !errors.Is(err, git.NoErrAlreadyUpToDate) {
		return Failed, fmt.Errorf("未能从远程仓库拉取最新版本，%w", err)
	}
	return Success, nil
}

func (r *GitRepository) CurrentRemote() (string, error) {
	if r.activeRemote == nil {
		return "", fmt.Errorf("未设置活动远程仓库")
	}
	return r.activeRemote.Config().Name, nil
}

func (r *GitRepository) Remotes() ([]string, error) {
	remotes, err := r.Repository.Remotes()
	if err != nil {
		return nil, fmt.Errorf("未能获取远程仓库列表，%w", err)
	}
	var remoteNames []string
	for _, remote := range remotes {
		remoteNames = append(remoteNames, remote.Config().Name)
	}
	return remoteNames, nil
}

func (r *GitRepository) SetActiveRemote(remoteName string) (RepositoryOperateStatus, error) {
	remote, err := r.Repository.Remote(remoteName)
	if err != nil {
		return InvalidRemote, fmt.Errorf("未能获取指定名称的远程仓库，%w", err)
	}
	r.activeRemote = remote
	return Success, nil
}

func (r *GitRepository) AddRemote(remoteName, remoteUrl string) (RepositoryOperateStatus, error) {
	_, err := r.Repository.CreateRemote(&gitconfig.RemoteConfig{
		Name: remoteName,
		URLs: []string{remoteUrl},
	})
	if err != nil {
		return InvalidRemote, fmt.Errorf("未能添加远程仓库引用，%w", err)
	}
	return Success, nil
}

func (r *GitRepository) RemoveRemote(remoteName string) (RepositoryOperateStatus, error) {
	err := r.Repository.DeleteRemote(remoteName)
	if err != nil {
		return InvalidRemote, fmt.Errorf("未能删除远程仓库引用，%w", err)
	}
	return Success, nil
}

func (r *GitRepository) CurrentBranch() (*plumbing.ReferenceName, error) {
	return r.activeBranch, nil
}

func (r *GitRepository) Branches() ([]string, RepositoryOperateStatus, error) {
	refs, err := r.Repository.Branches()
	if err != nil {
		return nil, Failed, fmt.Errorf("未能获取分支列表，%w", err)
	}
	var branchNames []string
	err = refs.ForEach(func(ref *plumbing.Reference) error {
		branchNames = append(branchNames, ref.Name().Short())
		return nil
	})
	if err != nil {
		return nil, Failed, fmt.Errorf("未能解析分支列表，%w", err)
	}
	return branchNames, Success, nil
}

func (r *GitRepository) RemoteBranches() ([]string, RepositoryOperateStatus, error) {
	if r.activeRemote == nil {
		return nil, InvalidRemote, fmt.Errorf("未设置活动远程仓库")
	}
	refs, err := r.activeRemote.List(&git.ListOptions{
		ProxyOptions: assembleProxyOptions(),
		Auth:         loadSSHAuthKeys(r.activeRemote.Config().URLs[0], r.authKeys),
	})
	if err != nil {
		return nil, Failed, fmt.Errorf("未能获取远程分支列表，%w", err)
	}
	var branchNames []string
	for _, ref := range refs {
		if ref.Name().IsBranch() {
			branchNames = append(branchNames, ref.Name().Short())
		}
	}
	if err != nil {
		return nil, Failed, fmt.Errorf("未能解析远程分支列表，%w", err)
	}
	return branchNames, Success, nil
}

func (r *GitRepository) Checkout(branchName string) (RepositoryOperateStatus, error) {
	err := r.worktree.Checkout(&git.CheckoutOptions{
		Branch: plumbing.NewBranchReferenceName(branchName),
	})
	if err != nil {
		return Failed, fmt.Errorf("未能切换到指定分支，%w", err)
	}
	return Success, nil
}
