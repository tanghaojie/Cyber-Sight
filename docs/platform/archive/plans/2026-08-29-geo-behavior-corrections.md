---
title: Geo 视图、地形与测量状态修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-29
updated: 2026-08-29
---

# Geo 视图、地形与测量状态修复

## 目标

让视图面板、当前地形和测量结果始终表达 Cesium Viewer 的真实状态，并修复视距上下限与测量单位的输入一致性。

## 背景与设计依据

现有视图快照只在少数 controller 操作后刷新；地形快照在 provider 成功替换前提前提交；测量面板只将单位应用于距离。修复遵循 [Geo 前端空间可视化工作台](../../design/modules/geo.md) 的插件边界、局部失败隔离和前端人工验收约定。

## 范围

- 视图 controller 订阅真实相机与场景模式事件，并在销毁时解除订阅；
- 同时校正最小、最大视距，确保 `minimumZoomDistance <= maximumZoomDistance`；
- 地形 provider 成功替换后才提交新快照，失败时保留旧的真实地形；
- 面积结果按米/千米显示 `m²`/`km²`，点位模式隐藏单位控件；
- 同步设计、计划、AI 记录与验证结果。

## 非目标

- 不新增 Geo 后端、契约或持久化；
- 不改变地形源目录或引入新远程服务；
- 不创建或运行前端自动化、端到端或浏览器测试。

## 前置条件和风险

- 相机事件必须在 controller 销毁时解除，避免重复监听；
- 地形异步加载期间 Viewer 仍使用旧 provider，UI 不得把目标源误报为当前源；
- 前端静态检查不能替代维护者对拖动、缩放、模式切换和失败地形的人工验收。

## 实施任务

- [x] 修复视图状态事件同步与视距上下限校正；
- [x] 修复地形切换的事务性状态提交；
- [x] 修复面积单位换算并隐藏点位单位控件；
- [x] 更新最终设计、验证结果和人工验收边界；
- [x] 归档计划和 AI 记录并创建提交。

## 测试与验证

- `pnpm format`、`pnpm format:check`；
- `pnpm --filter @cyber-ai-forge/frontend build`；
- `pnpm lint`、`pnpm architecture:check`；
- `pnpm docs:archive:check:ci`；
- `git diff --check`；
- 维护者人工验收相机拖动/缩放、右上模式切换、地形加载失败、面积单位和点位模式。

## 发布与回滚

随前端正常构建发布；若 Cesium 事件订阅或状态提交出现回归，可整体回滚本次提交。

## 实际偏差和遗留问题

- 视图状态使用 Cesium `camera.changed`、`camera.moveEnd` 与 `scene.morphComplete`，没有引入轮询或额外渲染循环；
- 地形加载失败改由 controller 的统一 `error` 展示，`terrain` 快照继续表示 Viewer 当前实际 provider；
- 沙箱内 Vite/esbuild 因 Windows 目录访问限制失败，同一前端构建在授权环境通过；
- `pnpm format`、`pnpm format:check`、前端生产构建、`pnpm lint`、`pnpm architecture:check`、`pnpm docs:archive:check:ci` 与 `git diff --check` 均通过；
- 按仓库边界未创建或运行前端自动化/浏览器测试，维护者仍需人工验收所列交互。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [本次 AI 协作记录](../ai-logs/2026/08/2026-08-29-geo-behavior-corrections.md)
