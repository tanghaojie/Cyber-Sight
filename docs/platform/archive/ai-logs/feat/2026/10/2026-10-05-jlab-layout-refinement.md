---
title: 桀士排版工作台交互调整
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-05
status: completed
change_type: feat
---

# 桀士排版工作台交互调整

## 用户目标和约束

维护者要求八项布局与交互修改，明确移除插图和下载。遵守工作区人类优先、文档先行、前端人工验收和自动提交约束。

## 方案与假设

Element Plus 左 Drawer 覆盖工作台，不改变分栏尺寸；四类设置共用抽屉。章节列表点击即时选中，保留列表便于继续比较。分隔图标绝对定位在边界，不占网格列；保留指针捕获与键盘控制。保留旧草稿素材兼容及 Markdown 远程图处理，删除新增本地插图命令和下载工具。

## 执行和验证

开始时暂存区和工作区为空；归档审计 NOT_DUE。CodeGraph 未索引到独立应用，转为读取精确文件。格式、应用 ESLint、vue-tsc 类型检查、生产构建、六模块边界和仓库所有权检查通过；构建仅出现 VueUse PURE 注释提示。最终 pnpm format:check、pnpm docs:archive:check:ci 和 git diff --check 均通过。未运行前端自动化或浏览器测试，桌面功能和公众号验收待维护者执行。无功能偏差，保留旧草稿素材兼容。

## 未决事项与关联

人工功能和公众号验收待维护者执行。设计：../../../../../design/apps/jlab-wechat-editor.md。计划：../../../../plans/2026-10-05-jlab-layout-refinement.md。关联提交为包含本文件的交付提交。

执行中发现 apps/wechat-editor/index.html 标题有并行修改；不属于本轮 AI 编辑，按人类内容保留且不纳入本次提交。
