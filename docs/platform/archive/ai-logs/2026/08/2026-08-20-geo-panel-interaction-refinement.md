---
title: Geo 数据面板与地图交互精简协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-20
status: completed
---

# Geo 数据面板与地图交互精简协作记录

## 用户目标和约束

用户要求精简底图和当前图层显示、找到并提供高德坐标校正开关、让对比功能显示真实图层名称并移除暂停/显示按钮，同时把默认地图光标改为抓手，标绘和测量保持十字光标。遵守仓库约定，不创建或运行前端自动化/浏览器测试。

## 关键问答与确认

- 暂存区门禁通过，任务开始时工作区无既有改动。
- geo 属于 Platform；`pnpm docs:archive:check` 返回 `NOT_DUE`。
- `.codegraph` 目录存在但索引命令不可用，代码定位改用常规只读检索。

## AI 的重要假设

- 用户所说的“坐标校正开关”对应现有 `allowGcj02` 显式加载门禁；本次不扩展为新的 GCJ-02 到 WGS84 算法。
- 底图源 warning 不再直接展开，但必要的禁用原因和错误仍需通过可访问 tooltip 或状态表达，避免失去可解释性。
- 对比图层名称应由数据模块通过 capability 发布，避免比较模块直接依赖数据控制器内部实现。

## 方案和执行摘要

精简 DataPanel 底图源卡片为名称、坐标系、状态、描述 i 图标 tooltip 和添加按钮；移除源卡片与当前图层的 warning 展示。数据控制器新增高德 GCJ-02 显式开关，并通过 `data.imageryLayerNames` capability 向比较插件提供真实图层名称；比较面板删除暂停/显示按钮；地图 canvas 默认使用 `grab`，标绘/测量仍使用 `crosshair`。

## 验证结果

`rtk pnpm format`、`rtk pnpm format:check`、`rtk pnpm lint`、`rtk pnpm architecture:check` 和 `rtk pnpm docs:archive:check:ci` 通过。前端 `vue-tsc` 与授权环境生产构建通过；构建保留既有 Sass legacy API、Rollup 注释和 Geo 大 chunk 警告。

## 未决问题与下一步

未运行前端自动化、端到端或浏览器测试，需维护者人工验收面板密度、tooltip、开关可用性、真实对比名称、关闭对比和光标切换。高德开关仍不新增通用 GCJ-02 到 WGS84 纠偏算法，只解除现有显式加载门禁；实际坐标偏移和第三方许可仍需部署方确认。

## 相关设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../../design/modules/geo.md)
- [Geo 前端编译期插件架构](../../../../decisions/ADR-20260814-geo-frontend-plugin-architecture.md)
- [Geo 影像默认源与失败隔离](../../../../decisions/ADR-20260820-geo-imagery-defaults.md)
- [Geo 数据面板与地图交互精简计划](../../../plans/2026-08-20-geo-panel-interaction-refinement.md)
- 关联提交：本轮最终 Git 提交（以 `git log -1` 为准）
