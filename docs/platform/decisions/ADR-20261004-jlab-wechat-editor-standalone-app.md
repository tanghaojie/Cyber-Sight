---
title: 桀士排版采用独立纯前端应用
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: accepted
date: 2026-10-04
---

# ADR-20261004-jlab-wechat-editor-standalone-app：桀士排版采用独立纯前端应用

## 背景

微排技术调研曾提出在现有 frontend 中注册公众号编辑模块。维护者现已明确选择 monorepo 中独立应用，并确认产品名称、技术栈、纯前端范围与交互裁剪。本 ADR 记录已确认约束，应用尚未实现。

## 决策驱动因素

- 排版工作台需要独立启动、构建和静态部署。
- 本地 Markdown 编辑、主题、结尾与剪贴板流程不需要服务端。
- 复用团队熟悉的技术栈，保留单页工作流。
- 收敛原站功能与工具栏复杂度，设置修改时保持预览可见。

## 考虑的方案

1. 在 apps/frontend 注册菜单和页面模块：原研究建议，未实施，现不采用。
2. 在 apps 中建立独立纯前端应用：维护者选择。

## 决策

- 产品为“桀士排版 · Markdown 公众号排版助手”，英文“JLab WeChat Editor”。
- 在 `apps/wechat-editor/` 独立交付；不接入现有 frontend 菜单、路由、认证和 AdminLayout。
- Vue 3、Pinia、Element Plus、Vite、TypeScript，单一页面，无 Vue Router、后端或 HTTP 业务 API。
- 内部按业务职责与组件组织，应用入口只组装；不创建对应空 backend/contracts 目录。
- 排除新手教程、文章包导入、全部 IP 功能。
- 顶部合并成一层，默认直接展开正文色、局部字色、章节样式；文字设置整合字号/间距/字体，与配色实验室、固定结尾平行。
- 高级配置用左侧向右的非模态抽屉，修改实时预览；主工作区保留 Markdown/预览双栏并允许拖拽比例。
- 本轮只调整设计与方案，不写应用代码。

## 正面结果

应用依赖与交付边界清晰，本地能力不依赖后台启动；设置与预览保持同一工作流，现有管理应用无需新增排版菜单。

## 负面结果与风险

独立应用需维护自己的构建入口与静态部署配置；所有权清单和检查覆盖需在实施前接入。纯前端无法保证云备份或服务端图床，浏览器本地数据与公众号复制仍需要失败处理和人工验收。

## 验证和复审条件

独立应用不得导入管理 frontend 私有代码或要求后台运行；排除功能不应出现在 UI 与数据模型中。未来若需要云存储、公众号 API、账号、嵌入管理系统或其他发布渠道，应重新评审，而不是沿用本 ADR 自动扩展。

## 相关设计

- [独立应用设计](../design/apps/jlab-wechat-editor.md)
- [公众号兼容规则](../design/wechat-editor-wechat-compatibility.md)
- [原站研究](../design/wechat-editor-research.md)
