---
title: Geo 外部 glTF 加载状态与自动定位修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-09-01
status: completed
---

# Geo 外部 glTF 加载状态与自动定位修复

## 用户目标和约束

修复 Geo 数据功能加载外部 glTF/GLB 时的 loading 反馈、Cesium Model 未 ready 提示和加载完成后未自动飞行问题。遵守当前 Geo 仅前端、模型会话内存态和维护者浏览器人工验收边界。

## 关键问答与确认

- 当前 `data.controller.ts` 已在 `loadModel` 成功后调用 `browser.flyTo`，但 `data-browser.ts` 立即读取 `model.boundingSphere`。
- 当前模型操作复用 `state.busy`，但外部数据面板没有模型专属 loading 文案或旋转反馈。
- `docs:archive:check` 结果为 `NOT_DUE`，没有重复 active 计划。

## AI 的重要假设

- “需要有交互才会消失”的英文提示来自模型尚未 ready 时读取包围球触发的 `state.error`；修复 ready 时序即可消除该错误路径。
- 自动飞行仍由 controller 负责，工具层只负责保证模型达到可安全定位的 ready 状态。

## 方案和执行摘要

已在 controller 增加模型操作状态和可访问 loading 反馈；纯 Cesium 数据浏览器在 Primitive 加入场景后等待 `readyEvent` 或已为 true，并请求一帧；成功后才注册资源，自动和手动定位都只读取 ready 模型的包围球。错误、取消和页面销毁沿用现有清理路径。

## 验证结果

`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`git diff --check` 通过；`vue-tsc` 随生产构建通过；授权环境 `pnpm --filter @cyber-ai-forge/frontend build` 通过。`pnpm docs:archive:check` 在实施前为 `NOT_DUE`。未运行前端自动化或浏览器测试，符合 Geo 验收边界。

## 未决问题与下一步

仍需维护者使用真实可访问的 glTF/GLB 在浏览器中验收加载动画、自动飞行、手动定位、失败清理和重复进入/退出。

## 相关设计、ADR、计划和提交

- 计划：`docs/platform/plans/active/2026-09-01-geo-model-loading.md`
- 设计：`docs/platform/design/modules/geo.md`
- 提交：`fix(geo): stabilize external glTF loading`（本提交）。
