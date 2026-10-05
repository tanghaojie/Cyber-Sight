---
title: 桀士排版工作台交互调整
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-05
updated: 2026-10-05
---

# 桀士排版工作台交互调整

## 目标与范围

按维护者八项要求调整独立排版应用：覆盖式左抽屉、无占位分隔图标、原稿标题旁导入、移除插图和下载功能、预览标题旁宽度 radio 与专注按钮、章节滚动选择抽屉、配色名称。仅 Platform，无 API、存储格式或依赖变更。

## 实施任务

- [x] 同步设计和模块边界。
- [x] 调整 workspace、article、typesetting 呈现和命令，移除废弃功能与提示。
- [x] 格式、Lint、类型、构建、架构和归档检查，审核 diff 后归档并提交。

## 验证与风险

不运行前端自动化测试。桌面抽屉覆盖、章节选择、拖拽键盘、导入、radio、专注及公众号效果由维护者人工验收；保留旧草稿图片恢复。格式、应用 ESLint、vue-tsc 类型检查、生产构建、六模块边界和仓库所有权检查通过；构建仅出现 VueUse PURE 注释提示。最终 pnpm format:check、pnpm docs:archive:check:ci 和 git diff --check 均通过。未运行前端自动化或浏览器测试，桌面功能和公众号验收待维护者执行。无功能偏差，保留旧草稿素材兼容。

## 依据与记录

设计：../../design/apps/jlab-wechat-editor.md；模块：../../design/modules/wechat-editor.md。AI 日志：../ai-logs/feat/2026/10/2026-10-05-jlab-layout-refinement.md。关联提交为包含本文件的交付提交。
