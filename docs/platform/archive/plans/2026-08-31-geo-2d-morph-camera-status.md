---
title: Geo 2D 场景过渡相机状态修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-31
updated: 2026-08-31
---

# Geo 2D 场景过渡相机状态修复

## 目标

修复 Geo 工作台从 3D 切换到 2D 时的 Cesium 渲染异常，保证视图面板和 Shell 指南针在场景形态过渡期间持续可用。

## 背景与设计依据

Cesium 1.144.0 的 `Camera.heading`、`pitch` 和 `roll` 在 `MORPHING` 模式可能返回未定义值。Geo 视图快照与页面级状态会在相机变化事件中读取这些字段，必须遵守 [Geo 前端空间可视化工作台](../../design/modules/geo.md) 的真实 Viewer 状态与局部插件边界。

## 范围

- 在纯 Cesium 视图工具中为过渡帧的角度字段提供稳定数值；
- 在页面级 GeoRuntime 的指南针状态读取中保留最近有效朝向；
- 更新 Geo 设计、计划和 AI 协作记录，并执行静态与人工浏览器验收。

## 非目标

- 不改变 2D、3D 或哥伦布视图的交互定义、相机位置或动画时长；
- 不修改 Viewer 生命周期、插件注册表或 Cesium 依赖版本；
- 不新增前端自动化测试。

## 前置条件和风险

- 本轮只处理 Cesium 场景过渡期间暂不可用的角度字段；其他相机字段维持 Cesium 的既有语义；
- 使用开发服务器人工复现，静态检查不代替用户界面验收。

## 实施任务

- [x] 复现 3D 切换 2D 时 `CesiumMath.toDegrees` 接收未定义值导致的渲染停止。
- [x] 让视图快照安全表达过渡帧角度，并让 Shell 指南针保留最近有效朝向。
- [x] 运行格式、类型、lint、架构、归档门禁和人工浏览器验收。
- [x] 补充实际结果并归档计划与协作记录。

## 测试与验证

- 生产构建、格式、lint、架构检查和文档归档 CI；
- 在本地 Geo 工作台点击右上 2D/3D 控制，观察 2D 进入、返回 3D、视图面板与浏览器控制台。

## 发布与回滚

该修复仅改变过渡帧状态的防御性读取；如出现意外行为，回滚本次单一提交即可恢复原状态。

## 实际偏差和遗留问题

- `pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`pnpm docs:archive:check:ci`、`git diff --check` 和授权环境的 `pnpm --filter @cyber-ai-forge/frontend build` 通过；
- 本地浏览器实际点击右上 2D，再返回 3D，两个方向均未捕获 `Runtime.exceptionThrown`、Cesium 渲染错误或控制台错误；
- 首次并行执行 lint 时，开发服务器短暂生成并删除 `vite.config.mts.timestamp-*.mjs`，ESLint 因文件消失失败。停止开发服务器后以干净文件状态重跑，lint 通过；
- 生产构建保留既有 Sass legacy API、Rollup `#__PURE__` 注释、动态导入和大 Geo chunk 警告；本轮未新增警告。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 前端编译期插件架构](../../decisions/ADR-20260814-geo-frontend-plugin-architecture.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-31-geo-2d-morph-camera-status.md)
- 关联提交：本次 `fix(geo): prevent 2d morph camera errors`
