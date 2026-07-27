---
title: 前端应用壳流式布局重构
date: 2026-07-27
status: completed
---

# 前端应用壳流式布局重构

## 用户目标和约束

用户反馈前端 layout 样式异常：`AppSidebar` 变成固定布局并挡住 `main`，`header` 也没有显示，要求重构整个 layout 样式。

仓库要求非简单改动先同步设计、实施计划和 AI 日志，并在验证完成后创建带真实模型 trailer 的提交。

## 关键问答与确认

无需额外确认。问题可以从当前实现直接定位：侧栏在所有视口脱离文档流，内容区通过独立断点补偿；同时移动抽屉默认打开，窄视口首次渲染必然覆盖顶栏和主内容。

## AI 的重要假设

- 用户所说的“固定布局”指侧栏不应在桌面端以覆盖层方式脱离壳层几何关系。
- 桌面端仍需要侧栏在滚动时保持可用，但应在网格列内粘性定位而非覆盖主内容。
- 移动端保留现有抽屉交互，但首次渲染应默认关闭。

## 方案和执行摘要

`AdminLayout` 已改为语义化两列壳层：桌面端侧栏进入第一列并在列内粘性定位，内容区进入第二列；窄屏时侧栏才切换为固定抽屉。`AppHeader`、`AppMain`、遮罩和用户区的几何样式集中到独立 `layout.scss`，侧栏内部视觉继续由 `sidebar.scss` 维护。

移动抽屉初始状态改为关闭，侧栏使用显式 `app-sidebar--open` 修饰类控制进入和退出；桌面媒体查询直接保证侧栏可见，不再依赖移动状态。顶栏和主内容移除分散的几何工具类，统一由应用壳样式管理。组件测试补充壳层区域存在、抽屉默认状态和通过顶栏/遮罩开关抽屉的回归场景。

## 验证结果

- `pnpm --filter @scaffold/frontend test` 通过：10 个测试文件、29 项测试全部成功。
- `pnpm --filter @scaffold/frontend build` 通过：Vue TypeScript 检查和 Vite 生产构建成功，1711 个模块完成转换。
- `git diff --check` 通过。
- 构建产物 CSS 检查确认：桌面应用壳生成 `280px minmax(0, 1fr)` 网格，内容位于第二列；侧栏基础规则仅用于移动固定抽屉，桌面媒体查询覆盖为网格内 `position: sticky`；顶栏生成独立 `position: sticky` 规则。

## 未决问题与下一步

本轮没有改变业务行为、数据或契约。按照网站构建规范，用户未明确要求浏览器测试，因此没有执行截图、DOM 检查或视口拖动；自动测试、类型检查、生产构建和构建产物 CSS 检查均已完成。Vite CJS Node API、Dart Sass legacy JS API 和第三方 PURE 注释仍输出既有非阻塞警告。

## 相关设计、ADR、计划和提交

- `docs/archive/design/frontend-shell.md`
- `docs/archive/design/dynamic-navigation-and-branding.md`
- `docs/archive/plans/2026-07-27-frontend-layout-refactor.md`
- 提交主题：`refactor(frontend): rebuild admin layout flow`
