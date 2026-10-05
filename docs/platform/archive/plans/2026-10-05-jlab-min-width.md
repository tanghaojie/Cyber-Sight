---
title: 桀士排版最小宽度 800px
scope: platform
repository: Cyber-Sight
status: completed
created: 2026-10-05
updated: 2026-10-05
---

# 桀士排版最小宽度 800px

## 目标与范围

按维护者要求将独立应用页面最小宽度从 1280px 改为 800px。保留双栏最低宽度 280/320px 和单层顶栏；顶栏内容不足时内部横向滚动。避开既有 index.html 修改，不改其他应用或 Foundation。

## 实施任务

- [x] 更新 body/workbench 宽度与顶栏溢出约束。
- [x] 同步现行设计和应用说明。
- [x] 完成构建、格式、差异及归档检查，归档并提交（提交前最终门禁）。

## 验证与遗留

暂存区为空，归档启动 DUE（完成计划达到三个），由同作用域归档复核计划处理。不运行前端自动化；800px 双栏、长文滚动、顶栏横向滚动和低于 800px 页面横向滚动由维护者人工验收。

## 关联

设计：docs/platform/design/apps/jlab-wechat-editor.md。日志：docs/platform/archive/ai-logs/style/2026/10/2026-10-05-jlab-min-width.md。关联提交为包含本文件的 style(wechat-editor) 提交。

应用 build（模块边界、vue-tsc、Vite）、ESLint、pnpm format:check、git diff --check 与归档 CI 检查均通过，归档状态 NOT_DUE。无范围偏差，实际页面显示待人工验收。
