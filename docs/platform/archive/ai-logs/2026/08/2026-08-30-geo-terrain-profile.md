---
title: Geo 地形剖面采样修复协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-30
status: completed
---

# Geo 地形剖面采样修复协作记录

## 用户目标和约束

用户要求修复 Geo 模块无法运行的地形采样：用户应画一根采样线，对沿线地形采样并显示截面。

## 关键问答与确认

- 任务开始时暂存区和工作区为空；
- `pnpm docs:archive:check` 返回 Platform `NOT_DUE`；
- 本次属于 Platform Geo 业务行为修复，需先更新设计和实施计划；
- 仓库禁止创建或运行前端自动化/浏览器测试，交互与视觉由维护者人工验收。

## AI 的重要假设

- “截面”按地形剖面实现：横轴为沿线累计距离，纵轴为采样高程；
- 用户以单击添加折点、双击完成采样线；路径可包含两点或多个折点；
- 使用当前 Viewer 的 terrain provider，不静默改换地形源。

## 方案和执行摘要

- 将采样入口从手工坐标调整为显式的地形剖面工作流；
- 纯 Cesium 工具负责画线、插值、采样、地图实体和释放；
- controller 通过 `InteractionManager` 管理互斥、状态、错误和完成；
- Vue 面板展示 SVG 剖面和关键统计，不引入图表依赖。

## 验证结果

- 地形剖面入口已从手工坐标采样改为地图画线，单击添加折点、移动预览、双击完成并支持 `Esc`/按钮取消；
- controller 已接入统一 `InteractionManager`，完成后沿路径生成至少 32、最多 500 个等距采样点；
- 当前 terrain provider 的高精度采样结果会生成贴合高程的地图结果线，并在面板中展示 SVG 剖面、总距离、最低和最高高程；
- 切换 terrain provider 会取消旧剖面操作并清除旧结果，静态渲染写入路径均显式请求重绘；
- `pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`git diff --check` 与授权环境前端生产构建通过；沙箱内构建仅因已知 Windows esbuild 目录访问限制失败；
- 未执行仓库禁止的前端自动化或浏览器测试。

## 未决问题与下一步

维护者需进行真实地形下的画线、剖面视觉和重复操作人工验收。

## 相关设计、ADR、计划和提交

- [Geo 当前设计](../../../../design/modules/geo.md)
- [本次实施计划](../../../../archive/plans/2026-08-30-geo-terrain-profile.md)
