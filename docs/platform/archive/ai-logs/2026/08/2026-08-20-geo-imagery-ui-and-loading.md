---
title: Geo 底图目录交互与默认加载修复协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-20
status: completed
---

# Geo 底图目录交互与默认加载修复协作记录

## 用户目标和约束

用户在本地测试环境人工验收 Geo，反馈底图/注记面板过长、许多源灰色不可加载以及地图容易卡死，授权运行本地调试。仓库约束禁止新增前端自动化或浏览器测试，需保留人工验收边界。

## 关键问答与确认

- 暂存区门禁通过，工作区起始时无既有未提交改动。
- `pnpm docs:archive:check` 返回 `NOT_DUE`，任务归属 Platform。
- 本地页面显示默认测试账号，使用该本地账号进入 `/geo` 进行人工复现；未读取或记录任何生产凭据。

## AI 的重要假设

- 天地图令牌是公开客户端配置，当前本地环境未配置；不生成或提交令牌。
- 高德源的 GCJ-02 限制是有意的坐标安全门禁，不在本次任务中静默放开。
- 远程候选源仍可由用户主动选择，但不应在无配置环境中自动成为默认底图。

## 方案和执行摘要

初步实现前的浏览器诊断确认：无天地图令牌时，数据插件自动回退到 Google 影像候选；4 秒内产生 109 个 Google 瓦片请求，68 个 `ERR_CONNECTION_CLOSED`，之后继续出现失败请求。面板主体滚动区域在 1280×720 下为 447px 高、938px 内容高，底图目录本身没有局部滚动，导致面板变长并显示原生滚动条。

计划采用本地 Natural Earth 默认底图、远程源显式加载、角色筛选/搜索/局部滚动和可解释状态反馈，并将 provider 错误同步到 Geo 控制器状态。

## 验证结果

- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、前端 `vue-tsc`/生产构建和 `pnpm docs:archive:check:ci` 均通过。
- 修复后 reload `/geo`：默认 Google 请求数为 0、失败请求为 0；Natural Earth II 可见，目录内容在 330px 区域内局部滚动。
- 角色筛选显示底图/注记/候选源计数；搜索 `GCJ-02` 显示高德坐标限制；天地图显示缺少 `VITE_GEO_TIANDITU_TOKEN` 的原因。
- 主动加载 Google 混合候选仍可复现外部瓦片失败，但只有该图层标记“瓦片异常”，Natural Earth 和 Viewer 保持可用；临时图层已清理。
- 构建保留既有 Sass legacy API、Cesium/Geo 大 chunk 和 AdminLayout 动态导入提示；不影响本次修复结果。

## 未决问题与下一步

- 远程第三方源的网络、CORS、限频和许可仍由部署方确认。
- GCJ-02 到 WGS84 的纠偏能力需另行设计，当前不在本次范围内。

## 相关设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../../design/modules/geo.md)
- [Geo 影像默认源与失败隔离](../../../../decisions/ADR-20260820-geo-imagery-defaults.md)
- [Geo 底图目录交互与默认加载修复计划](../../../../archive/plans/2026-08-20-geo-imagery-ui-and-loading.md)
- 提交：`d294531d92c33299d26dc6a72908d06652f08a89`
