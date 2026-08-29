---
title: Geo 渲染性能优化
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-29
updated: 2026-08-29
---

# Geo 渲染性能优化

## 目标

降低 Geo 在高分辨率集成显卡环境中的持续 GPU 压力，同时保持相机、图层、标绘、测量、地形动画和分屏等现有能力可见、可交互。

## 背景与设计依据

前台采样显示默认 Cesium 场景具有明显的像素填充瓶颈：同一环境从 `2560×1215` 降至 `1280×720` 后帧率由约 `12.6 FPS` 提升至约 `42 FPS`，将 `resolutionScale` 降至 `0.7` 后约为 `41 FPS`。现有 Viewer 持续渲染，鼠标移动又逐事件执行地球拾取。

设计依据为 [Geo 前端空间可视化工作台](../../design/modules/geo.md) 的“渲染性能策略”。

## 范围

- Geo 页面级自适应 `resolutionScale`；
- Cesium 空闲显式渲染及现有工具的主动重绘兼容；
- 状态栏鼠标地球拾取节流和相机移动隔离；
- 本地前端端口调整为 `5555`，后端及前端代理目标端口调整为 `5000`；
- 设计、计划、AI 日志、索引、验证结果和提交同步。

## 非目标

- 不降低 Geo 功能范围，不移除 HDR、FXAA、大气或既有插件；
- 不新增前端自动化或浏览器测试；
- 不修改 Foundation 的默认端口或提交本地环境凭据；
- 不调整后端 API、数据库或共享契约。

## 前置条件和风险

- `requestRenderMode` 要求所有直接场景写入显式请求帧，否则可能出现状态已变化但画面未更新；
- 动态分辨率必须忽略后台页和空闲间隔，并使用滞回避免画质振荡；
- `.env.foundation.local` 被 Git 忽略，本地端口变更不会进入提交，需在最终结果中单独确认。

## 实施任务

- [x] 实现自适应渲染比例和空闲显式渲染管理器；
- [x] 为场景设置、图层、交互预览、地形动画、模型和分屏等直接写入补齐主动重绘；
- [x] 实现鼠标拾取节流、相机移动暂停和末次位置补偿；
- [x] 修改本地前后端端口配置并核对 Vite 代理；
- [x] 完成格式、类型、生产构建、架构和文档门禁验证；
- [x] 更新最终文档、归档计划与 AI 日志并创建提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm --filter @cyber-ai-forge/frontend build`
- `pnpm lint`
- `pnpm architecture:check`
- `pnpm docs:archive:check:ci`
- 静态核对所有 Geo 动画和直接场景写入的 `requestRender()` 覆盖；前端行为仍由维护者人工验收。

## 发布与回滚

代码随前端正常构建发布。若显式渲染导致功能不可见，可回滚本次提交；本地端口可将三个本地配置值恢复为原值。

## 实际偏差和遗留问题

- 初始渲染比例采用约 `160` 万像素预算，在 `0.6` 到 `1` 范围内计算；连续帧低于 `28 FPS` 时每次降低 `0.1`，高于 `50 FPS` 时每次恢复 `0.05`，后台页和超过 `250ms` 的空闲间隔不参与调节。
- Viewer 使用 `requestRenderMode: true` 与无限仿真时间阈值；Geo 中当前直接修改场景、图层、模型和动态 `CallbackProperty` 状态的路径均补充主动重绘。
- 状态栏拾取限制为约 `20 Hz`，相机移动期间暂停，并在移动结束后使用最后位置补偿；空闲或后台超过 `1.5s` 时 FPS 显示为无数据而不是伪低帧率。
- 本地端口配置已实际启动验证：Vite 监听 `5555`，后端监听 `5000` 且 `/health` 返回 `200`。本地 PostgreSQL 未运行导致既有 API 日志保留清理提示失败，不影响端口验证。
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、前端 `vue-tsc`/生产构建和 `pnpm docs:archive:check:ci` 均通过。构建保留既有 Sass legacy API、Geo 大 chunk 与 `AdminLayout` 动静态导入提示。
- 按仓库约束未创建或运行前端自动化/浏览器测试；维护者仍需人工验收相机、图层、场景开关、标绘、测量、地形淹没、模型处理和分屏。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 渲染性能优化协作记录](../../archive/ai-logs/2026/08/2026-08-29-geo-rendering-performance.md)
- 关联提交：`feat(geo): optimize rendering performance`
