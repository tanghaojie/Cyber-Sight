---
title: Geo 使用第二个 HTML 构建入口
scope: platform
status: accepted
date: 2026-09-01
---

# 背景

Geo 当前作为 Platform 模块集成在 Sight 中，通过动态视图注册和 `/geo` 路由访问。后续需要允许 Geo 独立部署，同时保留现有 Sight 集成，并为未来接入后端保留模块扩展空间。

# 决策驱动因素

- 保持 Geo 源码和 Platform 模块边界稳定。
- 让 Sight 集成和独立 Geo 复用同一套配置、依赖和 Cesium 静态资源。
- 降低构建和部署维护成本，避免两套 Vite 配置、两份配置文件和两份 Cesium 资源。
- 为未来在 Platform Geo 模块中增加 API、状态和服务能力保留扩展位置。

# 备选方案

1. 新建独立 Geo package、独立配置和独立产物目录。
2. 在 Platform 中把 Geo 改为静态业务路由，再从 Sight 路由中复用。
3. 在现有 frontend 中增加第二个 HTML/TS 入口，一次 Vite 多入口构建。

# 决策

采用方案 3。

- 保留 `index.html` 和 Sight 当前 `/geo` 动态路由。
- 新增 `geo.html`，由 `src/geo-main.ts` 和 `src/geo-start.ts` 启动现有 Geo 工作台。
- 在同一个 `vite.config.mts` 中声明两个 HTML 输入，一次构建输出同一个 `dist`。
- `index.html` 与 `geo.html` 共用同一个 `dist/cesiumStatic/`，Cesium 基础路径永久保持 `/cesiumStatic/`。
- 继续复用当前运行时配置和 Platform/Foundation 安装逻辑，不维护第二份配置文件。

# 正向影响

- Sight 和 Standalone Geo 的构建入口清晰，代码共享最大化。
- Cesium 静态资源只有一个来源，避免版本和路径漂移。
- 未来 Geo 后端能力可以继续放在 Platform Geo 模块和 API 契约中，不影响入口方案。

# 负面影响与风险

- Standalone Geo 的 `dist` 会携带部分 Sight 资源，产物不是按页面完全裁剪的独立包。
- Standalone Geo 依赖部署层将默认文档配置为 `geo.html`，并从同一站点根路径提供 `/cesiumStatic/`。
- 两个入口共享构建失败边界，任一入口的类型或构建问题都会阻塞整次 frontend 发布。

# 验证与复审

已通过 `pnpm --filter @cyber-ai-forge/frontend build`、`pnpm lint`、`pnpm architecture:check`、`pnpm format:check` 和构建产物检查：一次 Vite 构建生成 `dist/index.html`、`dist/geo.html`，并只生成一个 `dist/cesiumStatic/`。浏览器中的 Sight `/geo` 和 Standalone Geo 行为仍由维护者人工验收。未来若需要按页面裁剪产物、不同部署基路径或独立版本发布，应重新评估本 ADR。

# 关联

- 设计：`docs/platform/design/modules/geo.md`
- 实施计划：`docs/platform/archive/plans/2026-09-01-geo-second-build-entry.md`
