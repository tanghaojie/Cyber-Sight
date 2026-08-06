---
title: 登录页主题外观入口
date: 2026-08-07
status: completed
---

# 登录页主题外观入口

## 用户目标和约束

用户要求在登录页设计并实现深色模式切换、主题颜色切换的入口。仓库约束要求保留既有未提交人类修改、先检查暂存区、遵守模块边界、完成验证并提交。

## 关键问答与确认

- 未提出额外视觉偏好；沿用现有 CYBER 登录页和系统设置的工业仪表视觉语言。
- 现有设置模块已拥有主题状态、六套主题色、持久化和根主题控制器，因此不重复实现状态或存储。

## AI 的重要假设

- “入口”解释为登录页右上角语言切换器旁的紧凑外观按钮，点击后打开包含深色开关与主题色选择的 Popover。
- 登录页主题切换应在登录前立即生效，并沿用设备级 `cyber_system_settings:v1` 设置。

## 方案和执行摘要

先阅读 `docs/README.md`、auth/settings/frontend 设计文档及有效 ADR；确认没有活动计划，归档检查结果为 `NOT_DUE`。实现阶段新增 auth 页面私有外观控制组件，使用 settings 模块登记的 Store 与主题元数据，并为 settings 增加中英文文案。入口位于登录页右上角工具区，PopOver 内提供深色模式开关和六色主题单选。

## 验证结果

已通过 `pnpm format`、`pnpm format:check`、`pnpm lint`、前端 `vue-tsc` 与生产构建；`git diff --check` 通过。构建仅报告既有 Sass legacy API、依赖注释和静态/动态导入提示。

## 未决问题与下一步

代码与当前设计、计划一致；浏览器行为和键盘交互仍需维护者按设计文档进行人工验收。

## 相关设计、ADR、计划和提交

- [登录页主题外观入口计划](../../../plans/2026-08-07-login-appearance-entry.md)
- [认证模块](../../../../design/modules/auth.md)
- [系统设置模块](../../../../design/modules/settings.md)
- 关联提交：`feat(auth): add login appearance controls`。
