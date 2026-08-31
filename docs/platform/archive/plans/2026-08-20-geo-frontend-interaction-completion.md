---
title: Geo 前端交互完善
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-20
updated: 2026-08-20
---

# Geo 前端交互完善

## 目标

完成 Geo 前端底图默认源、坐标校正、数据 Tab、图层对比、地图控制、标绘闭合、测量历史和导航高亮的用户需求，并让现行设计与实现一致。

## 背景与设计依据

- Geo 工作台遵循 `docs/platform/design/modules/geo.md` 的插件、纯 Cesium 工具、controller 和 Shell 分层。
- 用户明确要求 Google 底图/注记启动默认、天地图候选、高德 GCJ-02 启动自动校正、数据分类 Tab 和完整的地图工具交互。
- 既有 Natural Earth 默认源 ADR 与本轮产品要求冲突，已由 `ADR-20260820-geo-imagery-defaults-and-coordinate-correction.md` 取代。

## 范围

- 调整 imagery catalog 角色和 data plugin 默认加载。
- 在影像适配层增加默认自动坐标校正及 GCJ-02 到 WGS84 瓦片转换扩展点。
- 将数据面板的底图/注记、地形、外部数据改为互斥 Tab。
- 打开对比面板时刷新真实图层并同步左右选择项。
- 增加网页定位、正北指南针和相机旋转跟随。
- 修复面标绘闭合边；把测量当前结果改为历史列表，支持定位、删除单项和清空全部。
- 面板关闭时取消左侧导航所有高亮。
- 更新 Geo 设计、ADR、计划、AI 协作记录和索引。

## 非目标

- 不新增后端、API、数据库、场景保存或用户权限。
- 不创建或运行前端单元、组件、端到端或浏览器自动化测试。
- 不承诺 Google、高德、天地图的网络可达性、CORS、限频或商业许可。
- 不实现逐像素高精度重投影；当前校正限定为影像瓦片请求级坐标转换，并保留未来扩展边界。

## 前置条件和风险

- 任务仅修改 Platform 前端 Geo 和 Platform 文档。
- 工作区开始时暂存区为空且无既有未提交改动。
- 浏览器定位依赖用户授权和安全上下文；失败通过工作台状态提示，不阻塞地图。
- 坐标校正需要维护纯工具/影像 provider 生命周期和默认源的局部失败隔离。

## 实施任务

- [x] 更新默认 Google 底图/注记、天地图候选和启动坐标校正。
- [x] 实现可扩展坐标校正策略和 GCJ-02 瓦片转换。
- [x] 将数据面板改为三类 Tab，并修复对比面板刷新/选择同步。
- [x] 完成定位、指南针、标绘闭合和导航高亮修复。
- [x] 完成测量历史记录、地图定位、单项删除和全部清理。
- [x] 更新文档、归档计划和协作记录。

## 测试与验证

- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`。
- `pnpm --filter @cyber-ai-forge/frontend build`，包含 `vue-tsc` 和生产构建。
- `pnpm docs:archive:check:ci`。
- 静态核对默认源、坐标策略、controller/UI 调用链；地图定位、旋转、图层对比、标绘和测量由维护者人工浏览器验收。

## 发布与回滚

本轮只改变 Platform 前端和治理文档，不产生外部状态写入。若需回滚，恢复 Geo imagery/data、Shell controls、drawing、measurement、compare、runtime/page 文件和对应文档即可。

## 实际偏差和遗留问题

- 坐标校正实现为影像瓦片请求级中心点转换，不是逐像素重投影；该边界已写入 ADR。
- 生产构建在受限沙箱中首次触发 Vite/esbuild 目录访问限制，授权重跑后通过。
- 构建仍有 Sass legacy API、Rollup 注释、AdminLayout 动态/静态导入和 Geo chunk 体积提示；均未阻断构建。
- 按现行前端验证边界未创建或运行浏览器自动化测试；定位、旋转、图层对比、标绘和测量仍需维护者人工验收。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 影像默认源与坐标校正](../../decisions/ADR-20260820-geo-imagery-defaults-and-coordinate-correction.md)
- [Geo 前端交互完善协作记录](../../archive/ai-logs/2026/08/2026-08-20-geo-frontend-interaction-completion.md)
