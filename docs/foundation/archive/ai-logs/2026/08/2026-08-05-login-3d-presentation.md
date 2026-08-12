---
title: 登录页三维展示与交互拆分
date: 2026-08-05
status: completed
---

# 登录页三维展示与交互拆分

## 用户目标和约束

将登录页面拆分为左侧展示和右侧登录交互两个组件；左侧文字内容保持不变，重新设计其背景，呈现更高级、炫酷的三维动态效果。

## 关键问答与确认

未提出会改变范围的额外选择。遵循现有前端人工验收边界，不创建或运行前端自动化测试。

## AI 的重要假设

- 将现有 `LoginPage.vue` 的两类职责拆为 auth 页面私有组件，符合当前前端模块目录约定。
- 三维效果以 CSS 实现，避免引入依赖、网络资源或额外构建风险。
- “文字内容保持”指 `auth.locales.ts` 的既有品牌主张和表单文案均不修改。

## 方案和执行摘要

采用全息架构舱为视觉方向：`LoginPresentation.vue` 使用透视网格、发光几何体、轨道和数据节点形成纵深；`LoginInteraction.vue` 保留当前认证 store、语言切换、表单和 redirect 语义；`LoginPage.vue` 只保留响应式布局组合。三维动效使用 CSS，主题色通过既有语义令牌适配，减少动态效果偏好会停止连续动画。

## 验证结果

`pnpm format`、`pnpm --filter @scaffold/frontend build` 和 `pnpm format:check` 均通过。前端构建包含 `vue-tsc` 与 Vite 生产打包；输出既有 Sass legacy API、Rollup PURE 注释和静态/动态重复导入提示，未阻止构建。未创建或运行前端自动化测试，符合当前前端人工验收边界。

## 未决问题与下一步

无已知实现遗留问题。维护者可在浏览器中人工验收不同主题、桌面/窄屏宽度、减少动态效果偏好、键盘表单和实际登录/redirect 行为。

## 相关设计、ADR、计划和提交

- [认证模块设计](../../../../design/modules/auth.md)
- [实施计划](../../../plans/2026-08-05-login-3d-presentation.md)
- Git 提交：本轮完成后补充。
