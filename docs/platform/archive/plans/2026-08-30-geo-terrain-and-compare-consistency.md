---
title: Geo 地形与对比状态一致性修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-30
updated: 2026-08-30
---

# Geo 地形与对比状态一致性修复

## 目标

修复异步地形请求迟到覆盖用户最后选择，以及影像图层变化后对比候选和活动会话失真的问题。

## 背景与设计依据

严格对抗性审查确认：`setTerrain` 没有请求代次控制，共享 `busy` 也不能表达并发操作；对比 controller 使用一次性数字索引快照，未订阅数据插件的图层生命周期。现行设计要求 provider、UI 和会话状态保持一致。

## 范围

- 数据工具的地形 latest-request-wins 语义和并发 busy 计数；
- 数据插件登记稳定影像图层 capability；
- 对比插件按稳定 ID 自动同步候选，并在参与图层移除时关闭会话；
- 相关设计、计划、AI 日志和索引。

## 非目标

- 不修复天地图运行时兜底、瞬时瓦片错误恢复、模型工具状态和 GeoJSON 错误文案；
- 不改变影像 provider、地形算法、分屏视觉或新增前端自动化测试；
- 不修改 Foundation、后端或 API 契约。

## 前置条件和风险

- 保持数据插件为影像图层事实所有者，对比插件只能通过登记的 capability 协作；
- 旧地形请求无法保证取消底层网络，但必须阻止其提交或污染最新错误；
- 图层排序不应中断仍绑定同一真实图层的对比会话。

## 实施任务

- [x] 实现地形请求版本控制和并发 busy 计数。
- [x] 实现 `data.imageryLayers` capability 与数据插件发布。
- [x] 改造对比 controller/面板使用稳定 ID 并处理参与图层移除。
- [x] 更新设计并完成适用静态验证。
- [x] 归档计划与 AI 日志并创建带 AI trailer 的提交。

## 测试与验证

- `pnpm --filter @cyber-ai-forge/frontend build`
- `pnpm lint`
- `pnpm format:check`
- `pnpm architecture:check`
- `pnpm docs:archive:check:ci`
- `git diff --check`
- 人工边界：快速连续切换地形、对比期间新增/排序/移除图层由维护者浏览器验收。

## 发布与回滚

改动仅影响当前页面会话内状态。回滚对应提交即可恢复旧行为，不涉及数据迁移。

## 实际偏差和遗留问题

实现与计划一致，无范围偏差。生产构建在受限环境因 Windows/esbuild 目录访问权限失败后，在授权环境以相同命令通过；保留仓库既有 Sass legacy API、VueUse 注解和 Geo 大 chunk 警告。前端未创建或运行自动化测试，快速连续切换地形，以及对比期间新增、排序、移除图层仍需维护者人工浏览器验收。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-30-geo-terrain-and-compare-consistency.md)
