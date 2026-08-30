---
title: Geo 对比会话状态修复协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-30
status: completed
---

# Geo 对比会话状态修复协作记录

## 用户目标和约束

修复 Geo 对比未开始时可进入虚假“已启用”状态，以及暂停会隐藏左右图层、可能只剩地球底色的问题。

## 关键问答与确认

- Geo 属于 `platform` 作用域；
- 前端不新增或运行自动化浏览器测试；
- 暂停定义为暂时取消分屏，影像保持可见；显示定义为恢复已有 session 的左右分屏。

## AI 的重要假设

- 用户所说“暂停分屏”要求保留场景内容，而不是隐藏参与对比的图层；
- 关闭会销毁 session，关闭后必须重新“开始对比”，不能直接显示。

## 方案和执行摘要

为 controller 增加 session 存在状态；底层 session 暂停时把两个参与图层的 split direction 设为 `NONE`，恢复时设回 `LEFT/RIGHT`，不改变 `show`。

## 验证结果

- controller 以 `hasSession` 区分 session 存在性和当前分屏启用状态；未创建或关闭 session 时，“暂停”“显示”“关闭对比”均不可操作；
- `setEnabled(true)` 在无 session 时保持 `enabled=false`，不会再伪造已启用状态；
- 暂停把两张图层的 `splitDirection` 设为 `NONE`，恢复重新应用 `LEFT/RIGHT`，不再改写图层 `show`；
- `pnpm format`、`pnpm format:check`、`pnpm architecture:check`、`pnpm docs:archive:check:ci` 和 `git diff --check` 通过；
- `pnpm --filter @cyber-ai-forge/frontend build` 在授权环境通过，受限环境的首次失败为 Windows/esbuild 目录访问限制。

## 未决问题与下一步

最终交互与图层叠放效果由维护者人工验收；本任务未创建或运行前端自动化测试。

## 相关设计、ADR、计划和提交

- [Geo 当前设计](../../../../design/modules/geo.md)
- [实施计划](../../../../archive/plans/2026-08-30-geo-compare-session-state.md)
