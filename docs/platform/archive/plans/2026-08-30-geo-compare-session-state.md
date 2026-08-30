---
title: Geo 对比会话状态修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-30
updated: 2026-08-30
---

# Geo 对比会话状态修复

## 目标

让对比面板只表达真实存在的对比会话，并让暂停分屏保留影像可见性，避免仅剩地球底色。

## 背景与设计依据

当前 controller 在没有 session 时仍可把 `state.enabled` 写为 `true`；底层暂停通过隐藏左右图层实现，与“暂停分屏”语义不符。修复遵循 [Geo 当前设计](../../design/modules/geo.md) 的 controller、纯 Cesium 工具和人工验收边界。

## 范围

- 区分“存在 session”与“分屏已启用”；
- 无 session 时拒绝恢复，面板禁用“显示”；
- 暂停时取消 split direction，但保持两张影像可见；
- 恢复时为已有 session 重新应用左右 split direction；
- 同步现行 Geo 设计和协作记录。

## 非目标

- 不改变图层刷新或选择策略；
- 不新增前端自动化或浏览器测试；
- 不改变其他 Geo 插件。

## 前置条件和风险

- 仅使用现有 Cesium `ImageryLayer.splitDirection` 和 session 生命周期；
- 最终视觉和交互仍需维护者人工浏览器验收。

## 实施任务

- [x] 更新 SceneCompareSession 暂停/恢复语义；
- [x] 更新 controller 状态和面板按钮门禁；
- [x] 同步设计与 AI 记录；
- [x] 完成格式、类型、构建和文档门禁验证。

## 测试与验证

- `pnpm --filter @cyber-ai-forge/frontend build`；
- `pnpm format` 与 `pnpm format:check`；
- `pnpm docs:archive:check:ci`；
- `git diff --check`；
- 维护者人工验收未开始、开始、暂停、显示、关闭五个状态转换。

## 发布与回滚

仅修改 Geo 对比插件内部状态机和面板；回滚对应提交即可恢复旧行为。

## 实际偏差和遗留问题

实现与计划一致，无范围偏差。生产构建在受限环境因 Windows/esbuild 目录访问权限失败后，在授权环境以相同命令通过；保留仓库既有 Sass legacy API、VueUse 注解和 Geo 大 chunk 警告。前端未创建或运行自动化测试，未开始、开始、暂停、显示和关闭仍需维护者人工验收。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [本次 AI 协作记录](../ai-logs/2026/08/2026-08-30-geo-compare-session-state.md)
