---
title: Geo 模块设计协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-14
status: completed
---

# Geo 模块设计协作记录

## 用户目标与明确约束

- Cyber-Sight 后续业务顺序为 Geo、Market、Intelligence，当前先实施 Geo；
- Geo 延续维护者开源项目 `vue3-cesium-typescript-start-up-template` 的产品定位，是一个面向用户的 Cesium 前端页面；
- 当前不接入后端、PostgreSQL、管理能力、场景保存、Geo 专属权限或数据权限；
- 页面中接入的功能直接提供给用户，不建设管理员与普通用户两套入口；
- “架构重新设计”只指前端架构，重点解决 Viewer 生命周期、功能解耦和插件化；
- UI 现代化是本阶段重点，旧站视觉与交互不能原样迁移；
- “AI 基础设施”指 Sight 已有的 AI 辅助开发能力，不是 Geo 用户功能；Geo 不新增 AI 设计；
- 初始轮次只修订设计、ADR 和实施计划；维护者审核 UI 方向后已授权开始首版代码实施。

## 维护者纠正

上一版方案错误地把 Geo 定义为需要后端场景服务、PostgreSQL 持久化、授权贡献和用户侧 AI 命令的纵向业务模块。维护者明确否定这些范围。

本轮已撤销相关现行设计，不再把 Foundation 授权扩展、后端 API、共享契约、数据库 migration 或模型提供商作为 Geo 前置条件。历史提交保留事实记录，当前设计和 ADR 作为后续实施的唯一现行依据。

维护者随后进一步确认：

- `/geo` 不使用静态路由或 Platform 首页入口，而是由 Forge 菜单管理和动态路由加载；
- Geo 页面通过 `registerViews.ts` 登记组件；
- 页面不保留返回 Platform、首页或后台的入口；
- 设计必须明确 Viewer 在组件、插件和普通算法中的运行时使用方式，并展开插件系统的注册、安装、交互和清理逻辑。

维护者进一步纠正 Viewer 命名和逻辑/UI 分层：

- 代码中的普通名称 `viewer` 应表示真实 `Cesium.Viewer`，不能实际放入 `GeoViewerPort` 一类访问器；
- 旧项目 `src/libs/cesium/libs/` 的价值之一是提供不依赖 Vue 的 Cesium 业务工具，再由 `.vue` 负责具体调用和展示；
- 新架构需要明确纯工具模块如何通过插件适配层连接 Vue UI，而不是把算法、插件协议和界面写成同一层。

维护者随后审核并确认高保真 UI 方向稿，可以直接开始实施；实现中如有疑问可随时询问。首版视觉以地图优先、紧凑悬浮顶栏、左侧任务轨、按需上下文面板、右上地图控制和底部状态条为准。

## 首版实施启动

- 仓库运行环境为 Node `20.19.4`；官方包信息显示 Cesium `1.141.0` 及后续版本要求 Node 22，因此锁定支持 Node 20.19 的 `cesium@1.140.0`；
- Cesium 官方 Vite 示例要求复制 `Workers`、`ThirdParty`、`Assets` 和 `Widgets` 并配置 `CESIUM_BASE_URL`，本轮使用支持 Node 20 的 `vite-plugin-static-copy@3.1.4`；
- 首版不要求 ion token，先使用 Cesium 包内 Natural Earth II 静态影像，避免把外部凭据和未确认许可的数据作为 UI 骨架前置条件；
- 本轮交付动态视图注册、Viewer 生命周期、审定工作台 Shell 和真实相机/场景控制；复杂测量算法仍按计划在工具与插件垂直切片中实现。

## 2026-08-17 完整功能实施续期

- 维护者已将本地 Node 升级到 `24.19.0`，授权使用最新版 Cesium 并继续实施活动计划中的全部剩余功能；
- npm 官方注册表核对结果为 `cesium@1.144.0`，Node 要求 `>=22.0.0`，本轮据此替换原 `1.140.0` 临时兼容基线；
- 维护者指定旧项目 `imagery-manager/imagery-sources.ts` 作为底图需求参考。只读核对确认其包含天地图、高德、Google、本地示例和切片调试网格；
- 旧文件硬编码了天地图客户端令牌，本轮不复制该值。新实现仅从公开前端环境配置读取令牌，无配置时局部禁用对应底图；
- 高德源标记为 GCJ-02，必须通过适配处理坐标偏移或明确显示限制；第三方瓦片源按浏览器可达性、CORS 和许可作为可配置候选，不把可用性失败升级为 Viewer 整体失败；
- 维护者明确允许使用子智能体并行开发；主任务负责设计更新、依赖升级、Shell 集成、最终静态验证、文档归档和提交。

## 只读核对结果

### 旧站界面

通过应用内浏览器核对部署站点：

- 顶部约 122px 的灰色 Ribbon 横跨全屏，按“视图、效果、工具、地形、其他、应用”组织大量图标和开关；
- 左侧约 300px 的深色常驻栏同时承载影像、模型和地形列表；
- 顶栏与侧栏持续挤压地图画布，功能层级和当前操作上下文不够清晰；
- 视图、效果、标绘、测量、3D Tiles、模型和地形分析已形成可迁移的通用功能清单。

### 旧仓库源码

通过 GitHub 连接器只读核对旧仓库目录：

- 前端使用宽泛的 `components/`、`libs/`、`store/` 和 `views/` 目录；
- 工具状态在深层 Vuex 模块中继续嵌套，页面、工具和 Cesium 资源边界不够明确；
- 存在可作为算法证据的通用 Cesium 能力，也存在不属于 Geo 核心的行业大屏示例；
- 新实现应逐项解开全局依赖和生命周期耦合，不整体复制旧目录或示例应用。

针对维护者指定的 `src/libs/cesium/libs/` 再次通过 GitHub 连接器核对代表性文件：

- `Measure.ts`、`Draw.ts`、`FlyTo.ts` 和 `Highlight.ts` 直接接收 `Cesium.Viewer`，不 import Vue；
- `cesium-jt.ts` 以 Viewer 为参数延迟创建各工具，但旧实现通过 `viewer.jt` 扩展 Cesium 对象；
- Vue 等高线设置组件通过 inject 取得 Viewer，再操作 Cesium 材质；工具栏 3D Tiles 配置同时协调 Viewer、Vuex 状态和交互销毁；
- 新设计保留“纯工具接收真实 Viewer、Vue 调用工具”的方向，但不延续 `viewer.jt`、全局 store 协调和分散销毁。

### Cyber-Sight 接入点

- `platform.register.ts` 已在启动阶段发现 Platform 模块的 `registerViews.ts` 并注册到 Foundation `viewRegistry`；
- `dynamicRoutes.ts` 根据 Forge 菜单返回的路径、组件和布局动态生成页面路由；
- Geo 登记稳定组件键 `geo`，菜单使用 `/geo`、空布局和空功能权限即可直接渲染全屏页面；
- 该方案复用 Forge 现有认证、菜单管理和动态路由，不需要新增 Geo 后端或静态路由；
- 页面不提供返回 Platform 的入口，也不渲染 `AdminLayout`。

## 方案选择

- 单一前端所有权目录：`apps/frontend/src/platform/modules/geo/`；
- 唯一初始公共入口为 `registerViews.ts`，`geo.plugins.ts` 是模块内部组合文件；
- 每次页面访问创建独立 `GeoRuntime`；生命周期访问器明确命名为 `viewerAccess: GeoViewerAccess`；
- Vue 后代通过 `useCesiumViewer()`、插件通过 `GeoPluginContext.viewer`、纯工具通过构造参数或函数参数取得真实 `Cesium.Viewer`；禁止全局对象和 Pinia 保存 Viewer；
- `tools/` 只实现纯 Cesium 业务逻辑，插件创建工具和 controller，插件自有 `.vue` 接收 controller 并负责展示；
- 编译期插件按数据、视图、场景、标绘、测量、模型与地形分析拆分；
- 插件定义包含依赖、UI 贡献和安装函数；注册表负责校验、拓扑安装、局部错误隔离和逆序销毁；
- `InteractionManager` 保证鼠标主交互互斥，`DisposableScope` 与 `AbortSignal` 约束各插件的事件、异步任务和 Cesium 资源；
- 页面采用紧凑顶栏、左侧工具轨、按需上下文面板、选中时属性检查器和底部状态条；
- 状态只保存在当前前端会话，不设计业务持久化；
- Sight 现有 AI 辅助开发能力不在 Geo 文档中重复建设。

## 实际文档改动

- 重写 Geo 模块设计，删除后端、API、数据库、权限和用户侧 AI 范围；
- 用“Geo 前端编译期插件架构”ADR 替换错误的“插件与统一 AI 命令”决策；
- 用纯前端工作台实施计划替换包含 Foundation、后端、migration 和 AI 阶段的旧计划；
- 将接入方式修正为 Forge 菜单管理、`registerViews.ts` 和动态 `/geo` 路由，删除 Platform 首页和返回入口；
- 补充 `GeoRuntime`、Viewer 访问端口、Vue 注入、插件上下文、显式算法参数和异步取消规则；
- 补充插件契约、UI 贡献、依赖校验、安装顺序、互斥交互、资源 scope、capability 和事件协作规则；
- 将 `viewer: GeoViewerPort` 修正为 `viewerAccess: GeoViewerAccess`，并让组件、插件和纯工具中的 `viewer` 统一表示 `Cesium.Viewer`；
- 增加纯工具、插件 controller/UI contributions、插件自有 Vue UI 和通用 Shell 四层职责及调用示例；
- 更新 Platform 设计、ADR、活动计划和 AI 日志索引；
- 保留人工浏览器验收边界，不新增或运行前端自动化测试。

## 首版实际实现

- 增加 `cesium@1.140.0` 和 `vite-plugin-static-copy@3.1.4`，Vite 将 Cesium 四类静态目录发布到 `/cesiumStatic/`；
- 新增 Geo `registerViews.ts` 和中英文本地化资源，以组件键 `geo` 接入既有动态路由注册；
- 新增 `GeoRuntime`、`GeoViewerAccess`、`DisposableScope`、`InteractionManager` 和 Vue provide/inject 访问器；
- Viewer 使用包内 Natural Earth II 影像，无 ion token；默认关闭 Cesium 自带工具栏，由 Geo Shell 提供相机复位、2D/3D 和全屏；
- 实现审定视觉稿中的悬浮顶栏、任务轨、上下文面板、地图控制、状态条、加载失败和响应式降级布局；
- 实现纯 `DistanceMeasurementTool`、`MeasurementController` 和 `MeasurementPanel.vue`，支持加点、动态距离、双击完成、Esc 取消和清除；
- 其他任务组只显示明确的迁移占位，不伪装为已完成能力；右侧属性检查器等待真实选择对象后实现；
- 未修改后端、API 契约、数据库、权限、菜单 migration 或 Foundation 源码。

## 完整功能实际实现

- 运行环境确认升级到 Node `24.19.0`，前端依赖升级到 `cesium@1.144.0`，继续使用既有 Vite 静态资源复制方案；
- 新增 plugin registry、capability registry、event bus、插件独立 scope/abort、依赖拓扑安装、逆序销毁、局部 busy/error 和动态 UI contribution 渲染；
- `GeoWorkspacePage.vue` 改为从 `geo.plugins.ts` 组合数据、视图、场景、标绘、测量、模型、地形和对比八组内置插件，任务轨、面板和检查器不再硬编码业务组件；
- 数据能力参考旧项目源类型提供 Natural Earth II、天地图影像/矢量及注记、高德影像/矢量及注记、Google 影像/道路/地形候选和调试网格；未复制旧令牌，天地图只读取 `VITE_GEO_TIANDITU_TOKEN`，高德 GCJ-02 默认禁用并说明限制；
- 数据面板支持影像显示、排序、定位，以及当前会话 GeoJSON、glTF/GLB 和 3D Tiles URL 加载；外部失败保持局部，异步加载绑定插件 `AbortSignal`；
- 视图和场景面板实现定位、相机参数、2D/3D/哥伦布模式、视距限制、天体、大气、光照、阴影、地球底色和深度检测；
- 标绘实现点、线、面及当前/全部清理；测量实现点位、距离、面积及结果清理；所有鼠标主交互统一由 `InteractionManager` 互斥和取消；
- 模型能力通过 `activeTilesetCapability` 消费数据插件当前 3D Tiles，提供高亮、分类、偏移、裁剪、分屏和右侧属性检查器；
- 地形能力提供批量采样、淹没动画、等高线以及高程、坡度和坡向着色；对比能力提供真实影像图层选择、split slider、播放、暂停和关闭；
- 并行实现后进行了交叉复核，修正了默认底图兜底层被移除、外部加载跨销毁写入、插件资源重复销毁、地形异步竞态、模型裁剪资源所有权、对比泄漏校验和测量面板无效控制等问题；
- 未修改后端、共享契约、数据库、权限、菜单 migration 或 Foundation 源码。

## 验证记录

- `git diff --cached --quiet`：通过，修订前暂存区为空；
- `git status --short`：修订前工作区为空；
- `pnpm docs:archive:check`：`NOT_DUE`，无需创建文档归档审查计划；
- 旧站视觉、旧仓库整体结构和维护者指定 `src/libs/cesium/libs/` 代表性工具/UI 调用只读核对：完成；
- `pnpm format`：通过，修订文档已按仓库 Prettier 配置格式化；
- `pnpm format:check`：通过；
- `pnpm architecture:check`：通过；
- `pnpm docs:archive:check:ci`：通过，结果为 `NOT_DUE`；
- `git diff --check`：通过；
- 提交 trailer 验证待本轮提交后执行。

首版实现阶段新增验证：

- `pnpm --filter @cyber-ai-forge/frontend build`：通过；`vue-tsc` 无错误，Vite 生产构建成功，Cesium 四类静态资源均已复制；
- Geo 页面保持独立懒加载 chunk，约 `4.13 MB`，gzip 约 `1.11 MB`；
- `pnpm lint`：通过；
- `pnpm architecture:check`：通过；
- `tools/measurement` 依赖检索：没有 Vue、Pinia、Element Plus、插件和组件导入；
- 按仓库规则未创建或运行前端自动化、端到端和浏览器测试；视觉、测量交互与连续进出页面仍需维护者人工验收。

完整功能阶段最终验证：

- `pnpm format`、`pnpm format:check`：通过；
- `pnpm build` 内置的前端 `vue-tsc`、`pnpm lint`、`pnpm architecture:check`：通过；
- `pnpm build`：通过，API contract、后端和前端均成功构建，Cesium 四类静态资源成功复制；
- 完整 Geo JavaScript chunk 约 `4.28 MB`，gzip 约 `1.16 MB`；Geo CSS 约 `57.44 kB`，gzip 约 `11.06 kB`；仅保留既有 Sass、Rollup 注释和大 chunk 警告；
- `pnpm docs:archive:check:ci` 返回 `DUE`，原因来自 Foundation 归档台账基线之后的既有 Geo 架构提交。Cyber-Sight 下游任务不得修改 Foundation 台账，而检查脚本不识别 Platform 活动计划，因此创建 Platform 归档审查接续记录并如实保留门禁阻塞，留待明确的 Forge/Foundation 任务推进；
- 按仓库规则未创建或运行前端自动化、端到端和浏览器测试；1280×720 视觉、全部交互、连续路由进出、外部服务可达性和 WebGL 资源释放仍需维护者人工验收；
- Forge 菜单中的 `/geo` 记录仍由维护者通过菜单管理创建，不增加 migration。
- 2026-08-18，维护者确认归档审计把 Platform 触发与 Foundation 活动计划硬编码在一起属于后续 Forge 治理事项，明确授权本次忽略 `docs:archive:check:ci` 的 `DUE` 并按其他提交要求交付；本记录不把该门禁描述为通过。

## 遗留与人工验收边界

- 第三方影像、地形、模型和 3D Tiles 的许可、CORS、限频与区域可达性由实际部署环境和维护者选择决定；候选配置不构成服务稳定性承诺；
- `VITE_GEO_TIANDITU_TOKEN` 是会暴露给浏览器用户的公开客户端配置，不能放入要求保密的凭据；
- Forge 菜单中的 Geo 名称、图标和排序由维护者在菜单管理中确定，不进入 Geo 页面代码；
- 视觉、交互、连续进入/退出和长时间 WebGL 资源行为需维护者人工验收，静态检查与生产构建不能替代这些结论。

以上事项不会改变已确认的纯前端、单页、无管理、无数据库和无用户侧 AI 边界。

## 关联设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../../design/modules/geo.md)
- [Geo 前端编译期插件架构](../../../../decisions/ADR-20260814-geo-frontend-plugin-architecture.md)
- [Geo 前端工作台实施计划](../../../plans/2026-08-14-geo-frontend-workspace.md)
- [Geo 文档归档审查计划](../../../../plans/active/2026-08-17-geo-documentation-archive-review.md)
- 被纠正的初版设计提交：`45d29def200e01d989437dcf009c331b0207030a`；纯前端范围修正提交：`599a7d10210e23882dd629703f7b16190c390ac7`；动态菜单、Viewer 运行时和插件细化提交：`94615b0a6056304cac085d7371e18d5044d285e2`；Viewer 命名和纯工具/UI 分层修订见本记录所在提交。
