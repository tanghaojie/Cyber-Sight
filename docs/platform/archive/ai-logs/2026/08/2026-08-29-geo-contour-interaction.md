---
title: Geo 等高线交互修复协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-29
status: completed
---

# Geo 等高线交互修复协作记录

## 用户目标和约束

用户指出 Geo 地形“等高线”不应要求输入坐标，并要求优化交互：地图未加载地形时，应明确提示等高线无法使用。

## 关键问答与确认

- 任务开始时暂存区与工作区为空；
- `pnpm docs:archive:check` 返回 Platform `NOT_DUE`；
- 本次属于 Platform Geo 业务行为与交互修复，需要更新设计、实施计划、AI 记录并在最终验证后提交；
- 仓库禁止创建或运行前端自动化或浏览器测试，交互行为由维护者人工验收。

## AI 的重要假设

- “等高线”指当前地形表面的 Cesium 等高线材质，不是用户输入路径上的多条固定高程折线；
- `EllipsoidTerrainProvider` 表示地图未加载真实地形；
- 等高距是等高线唯一必要的用户参数，坐标继续只服务于采样和淹没。

## 方案和执行摘要

- 使用 Cesium `ElevationContour` 材质表达全地形等高线，并允许更新间距；
- controller 订阅真实 terrain provider 变化并暴露可用状态；
- 面板按任务分区，未加载地形时禁用等高线并提供数据面板引导；
- 删除不正确且不再使用的坐标连线式等高线工具。

## 验证结果

- 等高线入口不再解析坐标，而是直接设置 Cesium `ElevationContour` 材质和用户选择的等高距；
- 面板把等高线、地形着色和坐标分析分区，坐标分析默认折叠；
- 椭球体 provider 下等高线与地形着色控件禁用，并显示加载 World Terrain 或自定义地形的引导；
- provider 变化实时更新 `terrainAvailable`，切回椭球体会清除已启用的等高线材质；
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check` 和授权环境前端生产构建通过；沙箱内构建仅因已知 Windows esbuild 目录访问限制失败。

## 未决问题与下一步

维护者需人工验收真实地形切换、等高线视觉效果与面板交互。

## 相关设计、ADR、计划和提交

- [Geo 当前设计](../../../../design/modules/geo.md)
- [本次实施计划](../../../../archive/plans/2026-08-29-geo-contour-interaction.md)
