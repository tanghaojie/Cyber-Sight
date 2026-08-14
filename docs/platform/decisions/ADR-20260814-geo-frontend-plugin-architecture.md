---
title: Geo 前端编译期插件架构
scope: platform
repository: Cyber-Sight
status: proposed
owner: project maintainers
date: 2026-08-14
supersedes: none
superseded_by: none
---

# ADR-20260814：Geo 前端编译期插件架构

## 背景

维护者的旧 Cesium 项目提供了丰富的通用地图能力，但以全局 Viewer、宽泛技术目录和深层 Vuex 模块组织功能。若直接搬入 Cyber-Sight，会把页面、交互事件、Cesium 资源和工具状态重新耦合在一起。

Geo 当前是单一前端页面，不接入后端、数据库、Geo 专属权限或用户侧 AI。架构需要解决的是前端能力拆分、Viewer 生命周期、互斥交互和 UI 贡献，而不是设计一个通用远程插件平台。

## 决策

Geo 使用随 Cyber-Sight 源码构建和发布的编译期内置插件：

1. `registerViews.ts` 以稳定组件键 `geo` 登记页面，由 Forge 菜单管理提供路径、名称、图标、排序和动态路由；Geo 不声明静态路由；
2. 插件通过 `geo.plugins.ts` 显式注册，代码与应用一起审阅、构建和发布；
3. 每次页面访问创建独立 `GeoRuntime`；生命周期访问器命名为 `viewerAccess: GeoViewerAccess`，没有限定词的 `viewer` 一律表示真实 `Cesium.Viewer`；
4. Vue 后代通过 `useCesiumViewer()` 获得 `Cesium.Viewer`，`GeoPluginContext.viewer` 也直接提供 ready 后的 `Cesium.Viewer`；Viewer 不进入全局对象、响应式状态或 Pinia；
5. `InteractionManager` 保证同一时刻只有一个鼠标主交互工具激活，并负责工具切换清理；
6. 每个插件拥有自己的 Cesium 资源和事件，必须提供幂等销毁逻辑；
7. Vue 只管理可描述的界面状态，Cesium 实例和重资源对象不进入深度响应式状态；
8. Cesium 业务工具放在 `tools/`，只依赖 Cesium 和普通 TypeScript；插件负责把纯工具适配为 controller 和 UI 贡献，`.vue` 只展示并调用 controller；
9. 插件可以向工具轨、上下文面板、属性检查器或状态条贡献声明式 UI 元数据，但不能直接控制整个工作台布局；
10. Geo 菜单使用组件 `geo`、路径 `/geo`、空布局和空功能权限；页面直接全屏渲染，不提供返回 Platform 的入口；
11. 本架构不包含 AI 命令目录。Sight 的 AI 辅助开发能力属于仓库基础设施，不是 Geo 运行时插件职责。

## Viewer 运行时决策

- `GeoWorkspacePage.vue` 在挂载时创建并提供 `GeoRuntime`，卸载时销毁；
- Vue 后代组件通过 `useCesiumViewer()` 获得真实 `Cesium.Viewer`，插件通过安装参数获得 `context.viewer: Cesium.Viewer`，普通算法通过构造参数或函数参数获得 Viewer/Scene/Camera；
- `GeoViewerAccess` 使用非深度响应式引用保存 Viewer，并以 `whenReady()` 和 `require()` 约束未初始化、已失败和已销毁状态；运行时中的属性名为 `viewerAccess`；
- 异步任务必须同时使用运行时或插件的 `AbortSignal`，不能在路由离开后继续修改旧 Viewer；
- Geo 模块以外不允许访问 Viewer；未来需要跨模块嵌入时重新设计公共端口。

## 插件运行时决策

- `tools/` 中的类和函数禁止依赖 Vue、Pinia、UI、本地化或插件注册表，也不向 `Cesium.Viewer` 添加自定义属性；
- 插件安装时用真实 Viewer 创建纯工具，为工具建立 controller，并把 controller 作为 props 交给插件自有 `.vue` 面板；
- 纯工具负责 Cesium 算法和自身资源，插件负责互斥交互、busy/error 状态、UI 贡献和跨工具协调，Vue 负责输入与展示；
- 插件定义包含稳定 ID、显式依赖、排序和 `install(context)`；安装实例提供声明式 UI 贡献和 `dispose()`，贡献处理器可闭包当前运行时状态而不是创建模块级单例；
- 注册阶段拒绝重复 ID、缺失依赖和循环依赖；Viewer ready 后按拓扑顺序安装，页面离开时按逆序销毁；
- 每个插件拥有独立 `DisposableScope` 和 `AbortController`；交互工具另有子 scope；
- 普通动作直接执行，鼠标交互统一由 `InteractionManager` 串行切换；
- ScreenSpaceEventHandler、Entity、DataSource、Primitive、PostProcessStage、事件监听、DOM 监听和定时器必须在创建时登记清理；
- 插件之间通过最小类型化 capability 或事件协作，不直接 import 对方内部实现；
- 单插件安装失败只禁用该插件贡献，不销毁 Viewer 或其他成功插件。

## 选择理由

- 适合当前单体前端构建方式，不引入远程代码执行和版本协商；
- 能按视图、数据、场景、标绘、测量、模型和地形分析逐步迁移旧能力；
- 把最容易泄漏的事件、实体、Primitive 和定时器归还给各插件生命周期；
- UI 可以按用户任务重新组合，不再受旧源码目录或顶部 Ribbon 分类约束；
- 保持模块内实现简单，未来只有出现真实消费者时才提取更通用的端口。

## 被否决方案

### 整体嵌入旧项目

交付较快，但会保留全局状态、深层 store、旧 UI 和生命周期耦合，无法满足本次前端架构与视觉重设计目标。

### 单一巨大 Geo 页面和 store

初期文件少，但绘制、测量、拾取和地形分析会争夺同一批事件与状态，功能增加后难以定位和释放资源。

### 运行时远程插件或插件市场

当前没有第三方插件、独立发布或用户安装需求，却会引入远程代码信任、兼容协议和供应链风险，明显超出范围。

### 先设计后端场景模型和权限

用户已明确当前页面无需管理、保存和数据库能力。提前建设会改变产品目标并阻塞最重要的前端体验交付。

### UI 与 AI 共用命令总线

Geo 当前不存在用户侧 AI 用例。为假设能力建立命令抽象会增加复杂度，并错误复制 Sight 已有 AI 开发基础设施的职责。

## 影响

正向影响：

- 能力边界、资源归属和清理责任明确；
- 纯 Cesium 工具可以脱离 Vue 和 Geo 页面独立复用，UI 改版不会迫使算法层同步重写；
- 可独立启用、停用和验收每组功能；
- 地图工作台 UI 与底层算法解耦，可持续迭代视觉和交互；
- 复用 Forge 现有菜单管理和动态路由，不需要新增 Geo 后端、数据库表或 Foundation 授权扩展即可开始实施。

代价与约束：

- 旧算法迁移前需要解开全局依赖并补齐清理逻辑；
- 插件贡献类型和上下文端口必须克制，不能演变为万能 service locator；
- 编译期插件仍需随整个前端重新发布；
- 页面使用空布局且不提供返回入口，站内离开能力不属于 Geo 页面职责；
- 没有后端持久化，刷新后当前作业状态不保证保留。

## 复审条件

出现以下任一真实需求时复审本决策：

- 第三方团队需要独立发布和安装 Geo 插件；
- 第二个 Platform 模块需要嵌入或控制同一个 Geo Viewer；
- 用户需要保存、共享、审批或管理地图场景；
- 浏览器性能证明部分分析必须迁到 Worker 或服务端；
- 产品明确立项用户侧 AI 地图操作。

## 关联设计

- [Geo 前端空间可视化工作台](../design/modules/geo.md)
- [Geo 前端工作台实施计划](../plans/active/2026-08-14-geo-frontend-workspace.md)
