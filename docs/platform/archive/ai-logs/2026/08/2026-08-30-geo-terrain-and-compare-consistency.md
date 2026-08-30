---
title: Geo 地形与对比状态一致性修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-30
status: completed
---

# Geo 地形与对比状态一致性修复

## 用户目标和约束

用户要求只修复严格审查报告中的问题 2 和问题 3：地形异步切换竞态，以及对比会话未跟踪影像图层生命周期。不得扩展到其他已报告问题。

## 关键问答与确认

无需新增产品决策。按现行 Geo 插件边界，由数据插件发布影像图层 capability，对比插件声明依赖并消费；地形采用最新请求生效语义。

## AI 的重要假设

- 底层 Cesium 地形 provider 创建不一定支持真正取消，因此使用请求版本阻止迟到提交；
- 图层排序不会使绑定真实 `ImageryLayer` 的既有对比会话失效，只有参与图层移除才自动关闭；
- 前端交互不新增自动化测试，最终明确人工验收边界。

## 方案和执行摘要

先更新现行设计、活动计划和协作记录，再实施代码与验证。数据插件新增 `data.imageryLayers` capability，向对比插件发布稳定图层 ID、顺序和真实图层引用；地形工具用递增请求版本实现 latest-request-wins，数据 controller 用并发计数维护 `busy`。

## 验证结果

- 地形请求只有最新版本可以安装 provider；旧请求迟到成功或失败都不再覆盖当前快照和错误状态；
- 多个异步数据操作并发时，`busy` 在全部操作结束前保持为 `true`；
- 对比候选订阅数据插件的稳定图层集合，增删和排序后自动同步；活动会话的任一参与图层移除时，会在图层销毁前关闭会话并恢复 split 状态；
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`pnpm docs:archive:check:ci` 和 `git diff --check` 通过；
- `pnpm --filter @cyber-ai-forge/frontend build` 在授权环境通过，受限环境的首次失败为 Windows/esbuild 目录访问限制。

## 未决问题与下一步

最终交互由维护者人工验收：快速连续切换地形时最后一次选择生效；新增、排序、移除影像图层时对比候选同步；移除活动左右图层时会话关闭且分屏恢复，单纯排序不关闭会话。本任务未创建或运行前端自动化测试。

## 相关设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../design/modules/geo.md)
- [实施计划](../../../../archive/plans/2026-08-30-geo-terrain-and-compare-consistency.md)
- 关联提交：本次交付提交。
