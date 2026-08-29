---
title: Geo 等高线交互修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-29
updated: 2026-08-29
---

# Geo 等高线交互修复

## 目标

把等高线改为无需坐标的当前地形可视化，并在地图未加载真实地形时给出明确、可操作的不可用提示。

## 背景与设计依据

现有“等高线”先采样用户输入坐标，再按固定高度连接同一批点，既制造了无关输入，也不能表达真实地表等值线。修复遵循 [Geo 前端空间可视化工作台](../../design/modules/geo.md) 的地图优先、渐进披露、状态明确和 Viewer 事实来源约定。

## 范围

- 等高线直接使用 Cesium 地形等高线材质，只保留等高距参数；
- 地形面板按等高线、地形着色、坐标分析重组；
- 订阅真实 terrain provider 变化，椭球体状态下禁用等高线并显示加载引导；
- 切回椭球体时清除已启用的等高线；
- 删除不正确且不再使用的坐标连线式等高线实现；
- 同步设计、计划、AI 记录、验证结果和归档索引。

## 非目标

- 不改变地形数据源、鉴权或网络加载逻辑；
- 不修改坐标采样和淹没算法；
- 不新增后端、API 契约、持久化或前端自动化测试。

## 前置条件和风险

- Cesium 椭球体 provider 是“未加载真实地形”的判断边界；
- provider 变化监听必须在 controller 销毁时解除；
- 前端静态检查不能替代维护者对地形切换和等高线视觉效果的人工验收。

## 实施任务

- [x] 更新当前 Geo 设计与交互边界；
- [x] 修复等高线算法入口和 terrain provider 状态同步；
- [x] 重组地形面板并补充不可用提示；
- [x] 完成静态验证并记录人工验收边界；
- [x] 归档计划和 AI 记录并创建提交。

## 测试与验证

- `pnpm format`、`pnpm format:check`；
- `pnpm --filter @cyber-ai-forge/frontend build`；
- `pnpm lint`、`pnpm architecture:check`；
- `pnpm docs:archive:check:ci`；
- `git diff --check`；
- 维护者人工验收无地形提示、World Terrain/自定义地形切换、等高距更新、关闭等高线和坐标分析。

## 发布与回滚

随前端正常构建发布；若 terrain provider 监听或材质切换出现回归，可整体回滚本次提交。

## 实际偏差和遗留问题

- 等高线改用 Cesium `ElevationContour` 地形材质，等高距限制为 `1` 到 `10000` 米；原坐标采样连线实现已删除；
- controller 通过 `globe.terrainProviderChanged` 同步真实 provider，并在销毁时解除监听；
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check` 和前端生产构建均通过；
- 前端构建在沙箱内遇到 Windows esbuild 目录访问限制，相同命令在授权环境通过；
- 按仓库边界未创建或运行前端自动化或浏览器测试，维护者仍需人工验收所列交互。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [本次 AI 协作记录](../../ai-logs/2026/08/2026-08-29-geo-contour-interaction.md)
