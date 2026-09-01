---
title: 增加第二个 Geo 构建入口
scope: platform
repository: Cyber-Sight
status: completed
created: 2026-09-01
updated: 2026-09-01
---

# 用户目标与约束

用户确认按简化方案实施：Geo 同时支持继续集成在 Sight 中和独立构建部署；Sight 与 Standalone Geo 共用一次 frontend 构建、一个 `dist` 和唯一的 `dist/cesiumStatic/`。Cesium 路径继续固定为 `/cesiumStatic/`，不使用两份配置文件。

# 问答与决策

- 保留 Sight 现有 Platform 动态 `/geo` 路由，不修改为静态业务路由。
- 新增 `geo.html` 作为第二个 Vite HTML 入口，并通过 Geo 专用启动文件挂载现有 Geo 工作台。
- Standalone Geo 与 Sight 使用同一套运行时配置、Platform 注册和 Cesium 静态资源。
- 本轮不修改 `Cyber-AI-Forge`，也不引入后端 API；未来后端接入仍可在当前 Platform 模块边界内扩展。

# 重要假设

- `apps/frontend` 的 `process.cwd()` 是 Vite 构建根目录，现有 `index.html` 和新增 `geo.html` 均由同一 Vite 配置解析。
- `installPlatform(app)` 提供 Geo 页面所需的 Platform 定义和平台级本地化资源，不要求 standalone 入口安装完整 Sight Router 或 Pinia。
- Standalone Geo 的部署层能够把站点默认文档配置到 `geo.html`。

# 执行摘要

已新增 `apps/frontend/geo.html`、`apps/frontend/src/geo-main.ts` 和 `apps/frontend/src/geo-start.ts`；现有 `apps/frontend/vite.config.mts` 现在一次构建 `index.html` 与 `geo.html`，并继续把 Cesium 资源复制到唯一的 `dist/cesiumStatic/`。Sight 原有动态 `/geo` 路由和 `/cesiumStatic/` 固定路径未改变。

# 验证结果

已验证：`pnpm --filter @cyber-ai-forge/frontend build` 在授权环境中通过，`vue-tsc` 通过，Vite 完成 3544 个模块转换并生成两个 HTML 入口；`pnpm format:check`、`pnpm lint`、`pnpm architecture:check` 和 `pnpm docs:archive:check:ci` 均通过。受限环境曾因 Windows `Access is denied` 阻止 Vite 读取配置，授权环境重跑通过。构建警告仅为 Sass legacy API 和依赖包 Rollup 注释提示。

# 未决问题

- Standalone Geo 的域名、反向代理和默认文档配置属于部署环境，超出本轮仓库改动范围。
- Geo 页面和 Cesium 在目标浏览器中的实际运行仍需要维护者人工验收。

# 关联

- 计划：`docs/platform/archive/plans/2026-09-01-geo-second-build-entry.md`
- 设计：`docs/platform/design/modules/geo.md`
- ADR：`docs/platform/decisions/ADR-20260901-geo-second-build-entry.md`

# 实际遗留问题

- 两个入口的浏览器行为、Cesium 资源加载和部署层默认文档配置仍需维护者人工验收。
- 关联提交：待提交完成后补充。
