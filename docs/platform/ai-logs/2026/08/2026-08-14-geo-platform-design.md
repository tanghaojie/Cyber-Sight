---
title: Geo 模块设计协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-14
status: active
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
- 本轮只修订设计、ADR 和实施计划，不实施 Geo 业务代码。

## 维护者纠正

上一版方案错误地把 Geo 定义为需要后端场景服务、PostgreSQL 持久化、授权贡献和用户侧 AI 命令的纵向业务模块。维护者明确否定这些范围。

本轮已撤销相关现行设计，不再把 Foundation 授权扩展、后端 API、共享契约、数据库 migration 或模型提供商作为 Geo 前置条件。历史提交保留事实记录，当前设计和 ADR 作为后续实施的唯一现行依据。

维护者随后进一步确认：

- `/geo` 不使用静态路由或 Platform 首页入口，而是由 Forge 菜单管理和动态路由加载；
- Geo 页面通过 `registerViews.ts` 登记组件；
- 页面不保留返回 Platform、首页或后台的入口；
- 设计必须明确 Viewer 在组件、插件和普通算法中的运行时使用方式，并展开插件系统的注册、安装、交互和清理逻辑。

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

### Cyber-Sight 接入点

- `platform.register.ts` 已在启动阶段发现 Platform 模块的 `registerViews.ts` 并注册到 Foundation `viewRegistry`；
- `dynamicRoutes.ts` 根据 Forge 菜单返回的路径、组件和布局动态生成页面路由；
- Geo 登记稳定组件键 `geo`，菜单使用 `/geo`、空布局和空功能权限即可直接渲染全屏页面；
- 该方案复用 Forge 现有认证、菜单管理和动态路由，不需要新增 Geo 后端或静态路由；
- 页面不提供返回 Platform 的入口，也不渲染 `AdminLayout`。

## 方案选择

- 单一前端所有权目录：`apps/frontend/src/platform/modules/geo/`；
- 唯一初始公共入口为 `registerViews.ts`，`geo.plugins.ts` 是模块内部组合文件；
- 每次页面访问创建独立 `GeoRuntime`，Viewer 由非深度响应式适配器统一创建和销毁；
- Vue 后代通过 `useGeoRuntime()`、插件通过 `GeoPluginContext`、算法通过显式参数访问 Viewer；禁止全局对象和 Pinia 保存 Viewer；
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
- 更新 Platform 设计、ADR、活动计划和 AI 日志索引；
- 保留人工浏览器验收边界，不新增或运行前端自动化测试。

## 验证记录

- `git diff --cached --quiet`：通过，修订前暂存区为空；
- `git status --short`：修订前工作区为空；
- `pnpm docs:archive:check`：`NOT_DUE`，无需创建文档归档审查计划；
- 旧站视觉和旧仓库源码只读核对：完成；
- `pnpm format`：通过，修订文档已按仓库 Prettier 配置格式化；
- `pnpm format:check`：通过；
- `pnpm architecture:check`：通过；
- `pnpm docs:archive:check:ci`：通过，结果为 `NOT_DUE`；
- `git diff --check`：通过；
- 提交 trailer 验证待本轮提交后执行。

## 未决问题与实施时确认项

- Cesium 的具体稳定版本和 Vite 静态资源方案，在阶段 1 按当前依赖兼容性确认；
- 首批预置影像、地形、模型和 3D Tiles 需核对许可、CORS 和客户端令牌要求；
- 每项旧算法在迁移前判断复用或重写，并记录未迁移原因；
- Forge 菜单中的 Geo 名称、图标和排序由维护者在菜单管理中确定，不进入 Geo 页面代码。

以上事项不会改变已确认的纯前端、单页、无管理、无数据库和无用户侧 AI 边界。

## 关联设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../design/modules/geo.md)
- [Geo 前端编译期插件架构](../../../decisions/ADR-20260814-geo-frontend-plugin-architecture.md)
- [Geo 前端工作台实施计划](../../../plans/active/2026-08-14-geo-frontend-workspace.md)
- 被纠正的初版设计提交：`45d29def200e01d989437dcf009c331b0207030a`；纯前端范围修正提交：`599a7d10210e23882dd629703f7b16190c390ac7`；动态菜单、Viewer 运行时和插件细化见本记录所在提交。
