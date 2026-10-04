---
title: 公众号编辑器 HTML 与 CSS 兼容规范调研
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-04
status: completed
change_type: docs
---

# 公众号编辑器 HTML 与 CSS 兼容规范调研

## 用户目标和约束

读取公众号编辑器标准，确定 HTML 标签及样式范围，为后续实施准备。本轮只研究与写文档；原调研阶段未授权功能开发、账号操作或两处原文修订；随后维护者明确授权两处草案并确定独立应用方案。

## AI 的重要假设

手动粘贴、后台保存、客户端阅读、HTTP 草稿接口是不同验收阶段。官方规范或开源导出代码不足以证明每种标签与样式在这些阶段都保真。

## 方案和执行摘要

沿用 agent-reach 网页与 GitHub 路由，读取微信官方插件规范及其关联结构校验仓库。多代理分别核对官方接口、成熟开源导出实践和仓库文档边界。来源采用固定 SHA，规则按证据与作用链路标注；不把社区白名单当成官方标准。

首次修改前 `git diff --cached --quiet` 通过；工作区已有文件来自本会话上一轮未决归档复核。`pnpm docs:archive:check` 返回 Platform `IN_PROGRESS`、`due=true`，继续原归档计划，Foundation 继承只读。

## 验证结果

`pnpm format`、`pnpm format:check`、`git diff --check` 通过；相关 12 份 Markdown 的 205 条本地链接存在。最终归档 CI 返回 Platform `IN_PROGRESS`、`due=true`，审计程序退出码 10；Foundation `INHERITED`、Forge `EXCLUDED`。已有两处待决原文、ledger 和 Foundation 无差异。

规范/API 与导出实践分别由子代理只读审校，未发现事实错误；补齐降级新节点再次内联、表格/列表原生显示语义和异步输出固定 revision。研究文档明确 10 层特定冗余链与 CLI 15 层候选扫描口径，深色处理 whitelist 不等于 HTML 允许白名单。

官方 CLI 使用 Puppeteer，本轮未安装或执行；公众号真实粘贴、保存与客户端阅读未验收。没有新增代码、依赖、账号调用或测试。agent-reach 版本检查因本机无该二进制未执行成功；网页/GitHub 只读路由仍取得非空来源，不安装或更新工具。

## 未决问题与下一步

官方公开规范未给出完整过滤白名单。建议的导出范围需人工实测后晋升为项目兼容结论。前阶段同步设计及身份 ADR 待维护者决定；现已明确授权两处草案并同步，ledger 按已审查的真实提交推进。

原调研内容此前就绪但门禁未通过；本次授权后完成文档阶段收尾。独立应用决定由新的应用 ADR 记录，功能实现仍未开始。

## 关联

- [兼容规则文档](../../../../../design/wechat-editor-wechat-compatibility.md)
- [本轮计划](../../../../plans/2026-10-04-wechat-editor-wechat-compatibility.md)
- [Platform 归档索引](../../../../README.md)

## 2026-10-05 文档阶段收尾

授权修订后的最终文档格式、本地链接与 diff 检查通过；归档 CI 返回 `NOT_DUE`。此前 `IN_PROGRESS`/退出码 10 是原调研阶段真实结果，现已解除授权阻塞并按实际审查推进 Platform ledger。Foundation 未修改。

维护者授权两处修订并确定独立应用；旧菜单/后台建议已同步到现行设计，原站证据仍保留。仅文档变更，不创建应用、安装依赖或执行功能测试。相关提交为本轮 docs(platform) 文档提交；最终验证及提交树复核由现有 Platform 归档记录补充。
