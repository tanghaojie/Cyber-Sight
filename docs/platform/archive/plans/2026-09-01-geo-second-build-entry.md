---
title: 增加第二个 Geo 构建入口
scope: platform
repository: Cyber-Sight
owner: Platform
status: completed
created: 2026-09-01
updated: 2026-09-01
---

# 目标

在不改变 Sight 现有 Geo 集成方式的前提下，为 Geo 增加独立 HTML 构建入口，使同一次 frontend 构建同时产出 Sight 和 Standalone Geo 可部署的页面。

# 背景与设计

Geo 源码继续归属 `apps/frontend/src/platform/modules/geo/`，Sight 继续通过现有 Platform 动态视图注册和 `/geo` 路由访问 Geo。新增 `apps/frontend/geo.html` 和对应启动入口，由同一个 Vite 配置执行一次多入口构建。

构建产物只保留一个 `dist`：

- `dist/index.html` 作为 Sight 入口。
- `dist/geo.html` 作为 Standalone Geo 入口。
- Sight 和 Standalone Geo 都使用同一个 `dist/cesiumStatic/`。

Cesium 资源路径继续固定为 `/cesiumStatic/`，不增加第二份 Cesium 资源、不增加第二份配置文件，也不新建独立 Geo package。

# 范围

- 新增 Geo standalone HTML 和启动入口。
- 将 Vite 配置改为显式声明 `index.html`、`geo.html` 两个入口。
- 复用现有运行时配置、Platform 安装、定位资源和全局样式。
- 更新 Geo 设计、ADR、实施记录和目录索引。

# 非目标

- 不修改 `Cyber-AI-Forge`。
- 不把 Geo 从 Platform 动态路由改成静态业务路由。
- 不新增 Geo 后端、API 契约或独立部署配置。
- 不拆分或复制 `dist/cesiumStatic/`。

# 前置条件与风险

- `apps/frontend` 当前已经能通过现有 `pnpm build` 完成生产构建。
- Standalone Geo 部署时需要 Web Server 将站点根路径的 `/` 指向 `geo.html`，或通过部署平台配置默认文档；页面内部资源仍从站点根路径加载。
- 一个 `dist` 会包含 Sight 与 Geo 的构建资源，Standalone Geo 部署会携带部分未使用的 Sight 资源，这是保持构建简单和资源唯一的明确取舍。

# 实施任务

1. 新增 `geo.html` 和 `src/geo-main.ts`、`src/geo-start.ts`，复用现有 Platform 和 Foundation 启动依赖。
2. 在现有 `vite.config.mts` 中声明两个 HTML 入口，保持既有 Cesium 静态复制和 `/cesiumStatic/` 路径。
3. 更新设计、ADR、AI 记录及索引。
4. 执行格式检查、类型检查、生产构建、架构检查和文档归档检查。
5. 完成本地构建产物检查后归档本计划和 AI 记录，并创建带 AI trailer 的提交。

# 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm --filter @cyber-ai-forge/frontend build`
- `pnpm lint`
- `pnpm architecture:check`
- `pnpm docs:archive:check:ci`
- 检查 `dist/index.html`、`dist/geo.html` 和唯一 `dist/cesiumStatic/` 均存在。
- 浏览器中的 Geo 地图、Sight `/geo` 动态路由和 Standalone Geo 页面由维护者人工验收；前端仓库不新增自动化浏览器测试。

# 发布与回滚

发布仍上传同一个 `apps/frontend/dist`。需要独立 Geo 域名时，将该域名根文档配置为 `geo.html`，并让 `/cesiumStatic/` 和其他构建资源从同一 `dist` 提供。回滚时恢复到单入口 Vite 配置和删除 standalone 入口文件即可。

# 实际偏差与遗留问题

实施完成。`pnpm --filter @cyber-ai-forge/frontend build` 在授权环境中通过：`vue-tsc` 通过，Vite 完成 3544 个模块转换，生成 `dist/index.html` 和 `dist/geo.html`，并由 `vite-plugin-static-copy` 复制 4 组 Cesium 目录到唯一的 `dist/cesiumStatic/`。`format:check`、`lint`、`architecture:check` 和 `docs:archive:check:ci` 均通过；归档检查结果为 `NOT_DUE`。受限环境第一次运行 Vite 时出现 Windows `Access is denied`，授权环境重跑后通过。构建中的 Sass legacy API 和依赖包 Rollup 注释提示为警告，不影响构建结果。

浏览器中加载两个入口、Cesium Worker/Widget/Asset 以及 Sight `/geo` 动态路由仍需维护者人工验收；本轮未新增前端自动化测试。

关联提交：待提交完成后补充。

# 关联

- 设计：`docs/platform/design/modules/geo.md`
- ADR：`docs/platform/decisions/ADR-20260901-geo-second-build-entry.md`
