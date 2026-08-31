---
title: Geo 工作台与地形人工验收问题修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-31
updated: 2026-08-31
---

# Geo 工作台与地形人工验收问题修复

## 目标

修复维护者在 Geo 人工验收中发现的工作台遮挡、面板宽度、地形加载反馈、地形着色、淹没交互和剖面清理问题。

## 背景与设计依据

本任务属于 Platform Geo 前端模块。Geo 保持桌面工作台定位；底部 dock 和侧栏共享布局预留，地形工具继续通过插件 controller 与 `InteractionManager` 管理 Cesium 交互。

## 范围

- 让底部时间 dock 横向贯通，并使工具轨和面板为其自适应避让。
- 支持将左侧上下文面板拖拽调整到适合数据目录的宽度。
- 在地形资源切换期间显示局部 loading 状态。
- 调整等高距数字输入的增减控件样式。
- 使用有效的 Cesium 色带修复坡度、坡向材质。
- 以地图绘制多边形替代坐标文本输入的淹没边界。
- 提供独立的剖面采样线清除操作。

## 非目标

- 不新增前端自动化或浏览器测试。
- 不改变地形资源、服务端接口、持久化或移动端支持边界。

## 前置条件和风险

- Cesium 材质必须使用浏览器可消费的色带，且显式渲染模式下每次状态写入都请求重绘。
- 地形和淹没绘制都是互斥鼠标操作；过时异步地形请求不得覆盖最新 UI 状态。

## 实施任务

- [x] 统一底部 dock、状态条与侧栏的避让尺寸，并加入可调整宽度的面板。
- [x] 增加地形切换中的 loading 状态与可见反馈。
- [x] 修复坡度、坡向的 Cesium 色带材质和等高距输入样式。
- [x] 将淹没边界改为地图绘制，并加入剖面线清除。
- [x] 完成格式、类型、构建、架构、文档门禁与人工验收说明。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm architecture:check`
- `pnpm docs:archive:check:ci`
- `pnpm --filter @cyber-ai-forge/frontend build`
- 维护者在横向桌面视口人工检查布局、拖拽、地形加载、材质、绘制和清理流程。

## 发布与回滚

本次仅改变 Geo 前端会话行为。若出现问题，可回退本次单一 Git 提交；不会影响服务端数据。

## 实际偏差和遗留问题

前端自动化与浏览器自动化仍不在仓库授权范围。`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`pnpm docs:archive:check:ci` 和授权环境中的前端生产构建均已通过；Sass/Rollup 提示为既有构建警告。维护者仍需手工验收 Cesium 的动态材质、绘制交互和桌面布局。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 前端编译期插件架构](../../decisions/ADR-20260814-geo-frontend-plugin-architecture.md)
- [本次协作记录](../ai-logs/2026/08/2026-08-31-geo-workbench-terrain-acceptance-fixes.md)
