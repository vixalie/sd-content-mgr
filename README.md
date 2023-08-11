# SD Content Manager

SD Content Manager是基于Wails框架创建的，用于管理Stable Diffusion WebUI和ComfyUI中所使用到的资源的。SD Content Manager的整体功能与WebUI中的Civitai Helper插件类似，但可以提供更多功能以及更好的管理性能。

应用框架相关技术栈组成：

- [Go](https://golang.google.cn/): 1.20.7
- [Wails](https://wails.io/zh-Hans/): 2.5.1
- [Vite](https://cn.vitejs.dev/): 4.3.9
- [TypeScript](https://www.typescriptlang.org/): 5.1.6
- [React](https://zh-hans.react.dev/): 18.2.0
- [React Router](https://reactrouter.com/en/main): 6.14.2
- [Zustand](https://zustand-demo.pmnd.rs/): 4.3.9
- [Mantine](https://mantine.dev/): 6.0
- [Ramda](https://ramda.cn/): 0.29
- [React Query](https://tanstack.com/query/latest): 4.32.5
- [GORM](https://gorm.io/zh_CN/): 1.25.2
- [SQLite](https://pkg.go.dev/github.com/glebarez/sqlite@v1.9.0): 1.9.0
- [AG-Toolsbox](https://git.archgrid.xyz/xt/ag_toolsbox.git): 0.1.4

## RoadMap

- [x] A111 SD WebUI路径配置。
- [x] SD ComfyUI路径配置。
- [x] HTTP代理配置。
- [x] 已下载模型检索。
- [x] 已下载模型信息缓存。
- [x] 已下载模型信息补录。
- [x] 模型版本关系构建。
- [x] 模型激活提示词快速复制。
- [x] 模型下载。
- [ ] A111 SD WebUI版本更新。
- [ ] A111 SD WebUi扩展更新。
- [ ] A111 SD WebUI扩展安装。
- [ ] SD ComfyUI版本更新功能。
- [ ] SD ComfyUI读取A111 SD WebUI配置。
- [ ] SD ComfyUI自定义节点更新。
- [ ] SD ComfyUI自定义节点安装。
- [ ] 模型清理。
- [ ] 批量模型信息补录。

