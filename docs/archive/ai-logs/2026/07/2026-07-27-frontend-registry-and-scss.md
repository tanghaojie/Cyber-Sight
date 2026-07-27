---
title: 前端模块页面自动注册与 SCSS 重构
date: 2026-07-27
status: completed
---

# 前端模块页面自动注册与 SCSS 重构

## 用户目标和约束

用户在实际运行项目后要求集中修复前端：提高左侧菜单栏清晰度并改为高级偏黑色；取消中心 `view-registry.ts` 的逐模块手工登记；按模块拆分 Element Plus 全局变量和组件覆盖；把 CSS 迁移为 SCSS。

仓库要求非简单改动先同步设计、实施计划和 AI 日志，形成长期决策时新增 ADR，并在验证完成后提交。

## 关键问答与确认

无需额外确认。保留现有数据库组件标识和业务 URL，自动扫描解释为 Vite 构建期发现约定命名的注册文件，而不是运行时扫描文件系统或数据库驱动任意 import。

## AI 的重要假设

- 文件命名采用标准 `view-registry.ts`，导出函数命名为 `registerViews()`；示例中的 `registor` 视为表达注册意图而非必须保留的拼写。
- 第 3 项给出的 `.css` 名称与第 4 项合并后最终使用 `.scss` 后缀。
- “其他模块类似”指 Element Plus 每类组件覆盖独立维护，同时把项目基础、管理页面和侧栏样式按职责拆开。

## 方案和执行摘要

路由组合根使用 `import.meta.glob` 自动发现五个模块注册清单，registrar 校验名称格式和重复标识并冻结最终映射；各模块只在自己的 `view-registry.ts` 中登记页面。新增测试覆盖自动发现和失败模式。

原 `main.css` 已迁移为只包含组合声明的 `main.scss`，项目基础、过渡、管理页面、侧栏以及 Element Plus 全局变量和六类组件覆盖分别维护。侧栏改为石墨黑渐变并提高次要文字对比度。浏览器检查发现 Element Plus 按需 CSS 会后置覆盖普通规则，最终使用应用级高优先级选择器稳定覆盖。Sass 已作为前端开发依赖安装，`@parcel/watcher` 构建脚本明确保持禁用。

## 验证结果

- `pnpm test` 通过：API 契约 TypeScript 检查、后端 41 项和前端 28 项测试全部成功。
- `pnpm build` 通过：三个 workspace 均成功生成生产构建。
- `git diff --check` 通过。
- 浏览器使用真实本地后端和数据库验证桌面首页、用户管理页与 390 × 844 窄屏侧栏；无控制台 warning/error。
- 计算样式确认侧栏使用 `rgb(21, 24, 23)` 到 `rgb(9, 11, 10)` 渐变；Element Plus 主色 `#70cfa2`、圆角 `11px`、主按钮字重 `750`，输入框和表格覆盖均生效。

## 未决问题与下一步

Vite 5 的 Dart Sass legacy JS API 弃用提示和第三方 `@vueuse/core` PURE 注释提示仍存在，但不影响构建。后续升级 Vite 时可复审前者，无需为本次功能扩大改动范围。

## 相关设计、ADR、计划和提交

- `docs/archive/design/frontend-shell.md`
- `docs/archive/design/dynamic-navigation-and-branding.md`
- `docs/design/modules/frontend.md`
- `docs/decisions/ADR-0012-module-view-registration-and-scss-layering.md`
- `docs/archive/plans/2026-07-27-frontend-registry-and-scss.md`
- 提交主题：`refactor: modularize frontend views and styles`
