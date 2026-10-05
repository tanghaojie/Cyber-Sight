---
title: 桀士排版滚动与自动保存布局
scope: platform
repository: Cyber-Sight
status: completed
created: 2026-10-05
updated: 2026-10-05
---

# 桀士排版滚动与自动保存布局

## 目标与范围

修复原稿和预览长文滚动；底部左侧统计字数和阅读时长，右侧显示浏览器存储提示和产品信息；保存状态移到顶栏并移除手动保存入口。仅修改独立应用与 Platform 文档。避开既有人类修改 apps/wechat-editor/index.html。

## 实施任务

- [x] 修复网格行、面板和内部内容的高度约束。
- [x] 统一底部统计并迁移自动保存状态，清理结尾抽屉保存入口。
- [x] 同步设计和人工验收清单，执行允许的静态验证并归档。

## 验证与风险

启动暂存区为空；归档审计 NOT_DUE。执行应用构建（含边界、类型检查）、ESLint、仓库格式检查、diff 和归档 CI 检查。按仓库边界不运行浏览器自动化；长文双栏滚动、标题状态、自动保存恢复由维护者人工验收。字数是排版文字的非空白字符数，阅读时长按 300 字/分钟估算。保持现有保存事务及失败保护。

## 关联

- 设计：docs/platform/design/apps/jlab-wechat-editor.md
- 日志：docs/platform/archive/ai-logs/fix/2026/10/2026-10-05-jlab-scroll-autosave.md

## 实际结果

应用 build（模块边界、vue-tsc、Vite）、ESLint、pnpm format:check、git diff --check 与 pnpm docs:archive:check:ci 均通过，归档状态 NOT_DUE。无范围偏差；浏览器滚动和保存刷新恢复待人工验收。关联提交为包含本文件的 fix(wechat-editor) 提交，可通过 git log --follow 查证。
