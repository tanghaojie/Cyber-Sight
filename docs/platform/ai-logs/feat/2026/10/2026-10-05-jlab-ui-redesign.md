---
title: 桀士排版完整 UI 与交互改造
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-05
status: active
change_type: feat
---

# 桀士排版完整 UI 与交互改造

## 用户目标和确认

用户审查V2设计稿后要求实施整个修改，追加电脑阅读也有阅读外壳。保持左侧抽屉覆盖原稿、不挤压实时预览。完整实施包括输出质感与显式结尾片段；不把设计演示DOM改色复制到生产。

## 方案与重要假设

复用原有六模块、来源映射、版本和存储，新增呈现组件和清除标注领域命令。外壳为UI模拟，不产生文章事实或导出内容。最近颜色独立可丢弃记录；选区、气泡与外壳开关不纳入草稿。纯前端技术检查不等同维护者功能验收。

## 执行与验证

初始暂存为空、工作区干净；Platform归档NOT_DUE，Foundation INHERITED，Forge EXCLUDED。已在代码前建立[现行UI设计](../../../../design/apps/jlab-wechat-editor-ui.md)和[实施计划](../../../../plans/active/2026-10-05-jlab-ui-redesign.md)。2026-10-06已完成tokens、顶栏/颜色胶囊、实际章节卡片、八组配色、文字快捷档、Markdown辅助、手机/电脑外壳、revision选区气泡及清除、无布局位移Toast/诊断、终端代码块/引用/表格、显式结尾片段。

全仓format、format:check、Lint，应用typecheck/build/模块边界，根所有权、git diff --check、归档CI通过。未运行前端自动化/浏览器测试。构建有第三方PURE和主包504.72kB提示。抽屉在原稿拖窄时限制宽度；保留既有配置值与预设id；不修改Foundation、backend或api-contract。下一步记录真实实现提交并归档。

## 未决与关联提交

人工桌面交互和公众号兼容待维护者验收。关联提交为包含本记录的feat(platform)交付提交，创建后验证真实模型trailer。
