---
title: ADR-0008 前端采用 Tailwind CSS 与 Element Plus
status: accepted
date: 2026-07-23
---

# ADR-0008：前端采用 Tailwind CSS 与 Element Plus

## 背景

现有管理端主要依靠页面内手写 CSS 和自制基础控件。随着用户、角色、菜单、字典及后续业务模块增加，这种方式会重复实现布局、表格、表单、弹窗和反馈状态，也难以维持一致的响应式体验。

## 决策

`apps/frontend` 使用 Tailwind CSS 作为主要样式工具，使用 Element Plus 作为 Vue 3 通用交互组件库。项目通过 CSS 变量和有限的主题覆盖形成自己的视觉语言；业务组件不得把 Element Plus 默认视觉当作产品设计本身。

布局、间距、颜色、响应式和轻量状态优先用 Tailwind 工具类表达。表格、表单控件、分页、弹窗、菜单及反馈等存在复杂交互或可访问性要求的控件优先使用 Element Plus。局部 scoped CSS 仅用于工具类不适合表达的动画、伪元素和第三方组件深层主题覆盖。

## 影响

- 前端新增 Tailwind CSS、Element Plus 及其图标依赖。
- 组件模板会同时出现 Tailwind 工具类和 Element Plus 组件。
- 需要在 Vite 构建中加载 Element Plus 样式与 Tailwind 入口。
- 新页面应复用应用壳、导航模型和共享视觉令牌，避免重新创建平行的布局体系。

## 备选方案

- 继续维护纯手写 CSS：依赖更少，但基础交互和跨页面一致性的维护成本较高。
- 只使用 Element Plus：开发快，但容易形成默认后台模板外观，难以体现项目视觉。
- 只使用 Tailwind CSS：视觉自由度高，但表格、弹窗、分页等复杂交互仍需自行维护。
