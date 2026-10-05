---
title: 桀士排版滚动与自动保存布局
scope: platform
repository: Cyber-Sight
status: completed
date: 2026-10-05
change_type: fix
---

# 桀士排版滚动与自动保存布局

## 用户目标与关键约束

原稿和预览超出可滚动；底部左侧显示字数与阅读时长，右侧显示浏览器存储和产品信息；保存状态移到标题栏，删除立即保存并自动保存。遵守既有未提交改动保护与人工前端验收边界。

## 假设与方案

字数按正文和启用结尾的排版文字非空白字符统计，阅读速度使用 300 字/分钟。修复网格与 flex 高度链；保存使用现有 450ms 防抖及 IndexedDB 串行事务。删除结尾抽屉的重复手动保存入口及状态。

## 实际改动与验证

暂存区门禁通过；既有 index.html 修改避开；归档启动 NOT_DUE。应用 build（24 源文件、73 依赖边界检查、vue-tsc、Vite）、ESLint、pnpm format:check、git diff --check 与 pnpm docs:archive:check:ci 均通过，最终归档状态 NOT_DUE。未运行浏览器自动化，长文滚动和自动保存刷新恢复待人工验收。

## 关联

设计：docs/platform/design/apps/jlab-wechat-editor.md。计划：docs/platform/archive/plans/2026-10-05-jlab-scroll-autosave.md。关联提交以同主题 Git 提交为准。
