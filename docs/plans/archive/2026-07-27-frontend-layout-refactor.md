---
title: 前端应用壳流式布局重构
status: completed
created: 2026-07-27
updated: 2026-07-27
---

# 前端应用壳流式布局重构

## 目标

修复 `AppSidebar` 脱离桌面布局流后遮挡主内容、窄屏首次渲染遮挡 `AppHeader` 的问题，统一应用壳、侧栏、顶栏和主内容区的响应式布局职责。

## 背景与设计依据

当前 `AppSidebar` 在所有视口均使用 `position: fixed`，内容区再以 `lg:pl-[280px]` 补偿。两套相互独立的几何规则容易在断点、样式装载或嵌入式视口下失配。实现依据 `docs/design/frontend-shell.md`、`docs/design/dynamic-navigation-and-branding.md`、ADR-0008 和 ADR-0012。

## 范围

- 将桌面应用壳改为侧栏与内容区共同参与的两列网格。
- 将侧栏的固定定位限制到窄屏抽屉模式。
- 用布局语义类统一顶栏、主内容、遮罩和用户区域样式。
- 调整移动抽屉初始状态和相关组件测试。
- 更新设计、计划、AI 日志与索引。

## 非目标

- 不改变品牌视觉、导航数据、动态路由或业务页面。
- 不调整后端、API 契约、数据库或认证行为。
- 不新增布局模式、侧栏折叠宽度或用户偏好持久化。

## 前置条件和风险

- 开始修改前暂存区已确认为空。
- 断点两侧必须各自只有一套定位规则，避免 Tailwind 工具类和 SCSS 重复控制几何关系。
- 侧栏树可能超出视口，重构后仍需保持独立纵向滚动。

## 实施任务

- [x] 审阅仓库设计、ADR、历史计划和当前壳层实现。
- [x] 更新应用壳设计并建立计划与 AI 日志。
- [x] 重构应用壳、顶栏、主内容和侧栏的语义结构与 SCSS。
- [x] 补充响应式布局回归测试。
- [x] 执行前端测试、生产构建和差异检查。
- [x] 回写验证结果、归档计划并创建带 AI trailer 的提交。

## 测试与验证

- 前端 Vitest 覆盖移动抽屉初始关闭、壳层组件存在、顶栏打开抽屉、遮罩关闭抽屉和侧栏打开修饰类。
- `pnpm --filter @scaffold/frontend test`：通过，10 个测试文件、29 项测试。
- `pnpm --filter @scaffold/frontend build`：通过，Vue TypeScript 检查和 Vite 生产构建成功。
- `git diff --check`：通过。
- 构建产物 CSS 已确认桌面两列网格、内容第二列、侧栏桌面 sticky 与移动 fixed 抽屉规则均被正确生成。

## 发布与回滚

本次仅调整前端源码与文档，不改变数据。回滚对应提交即可恢复原布局。

## 实际偏差和遗留问题

用户未明确要求浏览器测试，按网站构建规范没有执行截图、DOM 检查或视口拖动；改为检查组件测试、生产构建与最终压缩 CSS。Vite CJS Node API、Dart Sass legacy JS API 和第三方 PURE 注释仍输出既有非阻塞警告。

## 相关设计、ADR 和 AI 日志

- `docs/design/frontend-shell.md`
- `docs/design/dynamic-navigation-and-branding.md`
- `docs/decisions/ADR-0008-tailwind-and-element-plus.md`
- `docs/decisions/ADR-0012-module-view-registration-and-scss-layering.md`
- `docs/ai-logs/2026/07/2026-07-27-frontend-layout-refactor.md`
