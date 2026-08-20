---
title: Geo 前端交互完善协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-20
status: completed
---

# Geo 前端交互完善协作记录

## 用户目标和约束

用户要求调整 Geo 默认影像与坐标校正、数据面板 Tab、图层对比刷新、网页定位和指南针、面标绘闭合、测量历史与清理，以及关闭面板后的导航高亮。遵守 Platform Geo 插件边界，不新增后端和前端自动化测试。

## 关键问答与确认

- 暂存区门禁通过，任务开始时工作区无既有未提交改动。
- Geo 属于 Platform；`pnpm docs:archive:check` 返回 `NOT_DUE`。
- `.codegraph/` 存在，先使用 CodeGraph 定位了 Geo controller、工具、面板和 Shell 调用链。
- 现有 Natural Earth 默认源 ADR 与本次用户明确的 Google 默认要求冲突，以本次用户指令为当前产品事实，并创建新 ADR 取代旧决策。

## AI 的重要假设

- Google 混合影像承担默认底图，Google 注记承担默认覆盖层；天地图影像、矢量和注记都归入候选源。
- `auto` 坐标校正只对 GCJ-02 源启用当前 GCJ-02 到 WGS84 瓦片请求转换，WGS84 源保持不变；未来坐标系通过策略类型扩展。
- 测量历史属于当前页面会话，不跨刷新持久化；每条记录由测量 controller 持有对应 Cesium 实体并负责删除和定位。

## 方案和执行摘要

使用纯工具承载影像校正、标绘闭合和测量结果实体；数据、对比、测量 controller 管理可描述状态；Vue 面板只负责 Tab、列表和控制调用。Geo runtime 新增浏览器定位、相机航向与回正北能力，页面关闭上下文面板时清除导航激活态。

## 验证结果

已通过 `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`pnpm --filter @cyber-ai-forge/frontend build`、`pnpm docs:archive:check:ci` 和 `git diff --check`。生产构建包含 `vue-tsc`，授权环境下 Vite 构建成功。未创建或运行前端自动化测试，保留维护者人工浏览器验收边界。

## 未决问题与下一步

待维护者人工验收：Google 默认底图/注记和候选源、GCJ-02 对齐、三类 Tab、对比刷新、浏览器定位、指南针、面闭合和测量历史交互；Google、高德、天地图的网络、CORS、限频和许可仍需部署方确认。

## 相关设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../../design/modules/geo.md)
- [Geo 影像默认源与坐标校正](../../../../decisions/ADR-20260820-geo-imagery-defaults-and-coordinate-correction.md)
- [Geo 前端交互完善计划](../../../../archive/plans/2026-08-20-geo-frontend-interaction-completion.md)
- 关联提交：`feat(geo): complete frontend map interactions`
