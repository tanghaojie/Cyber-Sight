---
title: 桀士排版独立应用设计与方案调整
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-04
status: completed
change_type: docs
---

# 桀士排版独立应用设计与方案调整

## 用户目标和明确决定

授权此前同步流程和身份 ADR 的两处草案。新应用中文名“桀士排版 · Markdown 公众号排版助手”，英文名“JLab WeChat Editor”；在 apps 下独立创建，纯前端，Vue 3/Pinia/Element Plus/Vite/TypeScript，无路由、无后端，不集成到 apps/frontend。

排除新手教程、文章包导入和全部 IP 功能。单层工具栏只直接展开正文色、局部字色、章节样式；文字设置整合字号/间距/字体，与配色实验室、固定结尾平行，通过左侧向右抽屉实时预览。保留 Markdown/预览双栏并允许拖拽分配比例。本轮不写代码。

## 方案与执行摘要

以独立应用设计作为产品方案权威来源，新 ADR 记录已确认的应用边界，研究报告保留原站证据并替换旧接入建议。内部组件化和业务职责组织不等于在 apps/frontend 注册产品模块。接口、数据库、菜单与账号不进入本轮范围。

多代理分别只读审校旧措辞、交互/状态与归档收尾。首次修改前暂存区检查通过，启动审计返回 Platform `IN_PROGRESS`；已有未提交文件归属本会话。按授权修订两处原文，保留身份 ADR 其他决定。

## 重要假设

默认三项指直接显示的排版控件；三类高级配置仍以平行按钮显示在同一工具栏。抽屉采用占位、非模态面板，确保预览可以继续操作。尺寸、比例和内部接口作为工程方案建议，尚未实现。

## 验证与未决问题

文档内容经两名子代理分别审校产品边界和交互/状态；修正旧报告的品牌/IP 残留，补齐非模态键盘焦点、混合选区整次拒绝和单图恢复候选范围。`pnpm format`、`pnpm format:check`、本地链接检查、`git diff --check` 通过；归档 CI 返回 `NOT_DUE`，Foundation `INHERITED`、Forge `EXCLUDED`。

本轮所有变更均为 Platform 文档。应用代码、依赖、根脚本、所有权清单和 Foundation 没有修改；没有运行应用构建/自动化测试。公众号兼容规则仍待人工验收，不把布局方案或静态文档当作已实现功能。

## 关联

- [独立应用设计](../../../../../design/apps/jlab-wechat-editor.md)
- [本轮计划](../../../../plans/2026-10-04-jlab-wechat-editor-design.md)
- [独立应用 ADR](../../../../../decisions/ADR-20261004-jlab-wechat-editor-standalone-app.md)

## 2026-10-05 文档阶段收尾

维护者授权两处修订并确定独立应用；旧菜单/后台建议已同步到现行设计，原站证据仍保留。仅文档变更，不创建应用、安装依赖或执行功能测试。相关提交为本轮 docs(platform) 文档提交；最终验证及提交树复核由现有 Platform 归档记录补充。
