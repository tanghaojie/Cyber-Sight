---
title: Geo Google 混合默认底图
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-31
updated: 2026-08-31
---

# Geo Google 混合默认底图

## 目标

将 Geo 启动阶段的默认影像收敛为 Google · 混合底图，不自动加载 Natural Earth II 或天地图。

## 背景与设计依据

本任务属于 Platform Geo 前端模块。当前影像默认源 ADR 被新的 Google · 混合默认底图决策取代；影像目录、手动加载、坐标校正和可恢复瓦片状态仍沿用现有模块边界。

## 范围

- 修改 Data 插件的启动影像初始化顺序。
- 更新 Geo 当前设计和影像默认源 ADR。
- 完成因 Platform 审计到期而要求的归档审查。

## 非目标

- 不删除 Natural Earth II、天地图或其他目录源。
- 不新增自动兜底、健康检查、重试或前端自动化测试。
- 不修改后端、API 契约、持久化或坐标校正实现。

## 前置条件和风险

- Google 的网络、CORS、限频和许可不受应用控制。
- 默认图层故障保持局部 `degraded` 状态，不能回退为自动创建其他图层。

## 实施任务

- [x] 在设计、计划、AI 协作记录和 ADR 中固定新的启动默认。
- [x] 将 Data 插件启动阶段改为仅添加 Google · 混合底图。
- [x] 执行格式、类型、构建、归档和 diff 验证。
- [x] 归档完成计划和协作记录，并创建带标记的 Git 提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm architecture:check`
- `pnpm --filter @cyber-ai-forge/frontend build`
- `pnpm docs:archive:check:ci`
- `git diff --check`
- 维护者人工检查有无天地图令牌时的默认图层、手动添加其他源和 Google 瓦片失败状态。

## 发布与回滚

本次只改变 Geo 前端会话启动图层。若需要恢复旧默认，可回退本次单一提交；不会影响服务端数据。

## 实际偏差和遗留问题

实现与计划一致。`pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check` 和授权环境中的前端生产构建通过；前端自动化不在仓库授权范围，Google 网络、CORS、限频、许可及动态瓦片状态仍由维护者人工验收。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo Google 混合默认底图 ADR](../../decisions/ADR-20260831-geo-google-hybrid-default.md)
- [本次协作记录](../ai-logs/2026/08/2026-08-31-geo-google-hybrid-default.md)
