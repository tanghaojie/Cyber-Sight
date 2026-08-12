---
title: 添加前端系统设置入口
date: 2026-07-31
status: completed
---

# 添加前端系统设置入口

## 用户目标和约束

在 Header 用户下拉加入“系统设置”。弹窗配置导航菜单风格、主题颜色、深色模式、Tags View、侧栏 Logo 与动态标题；所有配置仅前端持久化，不保存到后端，功能逐项后续实现。用户要求使用 `frontend-design` 设计弹窗。

## 关键问答与确认

无；按用户要求直接实施。

## AI 的重要假设

- “功能预留”表示本轮允许编辑和恢复设置，但不改变当前应用壳的实际样式与行为。
- 设置是浏览器设备级偏好，暂不按登录账号隔离。

## 方案和执行摘要

在 `apps/frontend/src/modules/system/settings/` 新建 Pinia Store、Dialog 与中英文资源。Store 对完整配置进行运行时校验，并通过 `cyber_system_settings:v1` 恢复与保存；存储不可用时降级为内存状态。Dialog 使用浅色管理端基调上的深色状态卡片、布局预览与颜色色板；先编辑草稿，保存时才写入 Store。`AppHeader.vue` 的用户下拉新增“系统设置”，不改变原有退出流程。

## 验证结果

`pnpm format`、`pnpm format:check`、`pnpm lint` 和 `pnpm build` 均通过。全量构建包含项目已知的动态/静态导入分包提示与 Sass legacy API 弃用提示，不影响构建成功。遵循前端验证边界，未创建或运行前端自动化/浏览器测试，仍需维护者人工验收弹窗交互与各项持久化恢复。

## 未决问题与下一步

后续各设置项的实际消费者、即时应用或下次刷新生效策略，将在对应功能任务中单独确认和实现。

## 相关设计、ADR、计划和提交

- [设置模块设计](../../../../design/modules/settings.md)
- [实施计划](../../../plans/2026-07-31-system-settings.md)
- 无 ADR；提交在最终 diff 审核后创建。
