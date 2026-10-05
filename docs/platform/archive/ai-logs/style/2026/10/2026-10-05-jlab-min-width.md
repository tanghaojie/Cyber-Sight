---
title: 桀士排版最小宽度 800px
scope: platform
repository: Cyber-Sight
status: completed
date: 2026-10-05
change_type: style
---

# 桀士排版最小宽度 800px

## 用户目标与方案

维护者要求页面最小宽度为 800px。同步 body/workbench 最小宽度，保留桌面双栏和 300px 抽屉；单层顶栏在空间不足时内部横向滚动，避免控件溢出撑大页面。

## 约束与验证

暂存区为空；工作区既有 index.html 修改不触碰。启动归档审计 DUE，按同作用域归档复核计划检查 25ff537..b1a098c，当前代码与设计一致；无需归档有效 ADR/Design。台账更新到已复核真实 b1a098c，Foundation 不变。应用 build（模块边界、vue-tsc、Vite）、ESLint、pnpm format:check、git diff --check 与归档 CI 检查均通过，归档状态 NOT_DUE。不运行浏览器自动化，800px 页面实际显示待人工验收。

## 关联

设计：docs/platform/design/apps/jlab-wechat-editor.md。计划：docs/platform/archive/plans/2026-10-05-jlab-min-width.md 与 docs/platform/archive/plans/2026-10-05-jlab-width-archive-review.md。关联提交为包含本文件的 style(wechat-editor) 提交。
