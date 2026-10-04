---
title: Punk 微排技术调研报告
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-04
status: completed
change_type: docs
---

# Punk 微排技术调研报告

## 用户目标和约束

用户计划在 Cyber-Sight 复刻 Punk 微排，要求梳理技术架构、功能与实现逻辑并形成报告。本轮交付文档，后续模块名称、实现范围及产品决策仍待评审。

## 关键问答与确认

直接依据用户请求调研网站；没有新增功能或公众号发布授权。已执行暂存区门禁，开始时无既有改动；归档审计为 NOT_DUE。

## AI 的重要假设

主要作用域为 Platform。未找到可信的目标公开源仓库，部署脚本能够证明浏览器逻辑，不能证明服务端源码、部署商或全部 API 的存在与否。

## 方案和执行摘要

使用 agent-reach 的网页/GitHub 路由，Jina Reader、HTTP 资源读取与原始页面交互互相核对；以部署资源文件名和 SHA-256 固定证据。三名子代理分别静态分析渲染/复制、本地状态/素材、当前仓库适配。仓库代码定位先使用 CodeGraph。下载文件与临时分析产物置于系统 TEMP，不进入仓库。

## 验证结果

目标站核验工具栏、配色实验室、固定结尾和专注预览。默认示例复制后，在调研浏览器剪贴板取得 text/html 188,061 字符、text/plain 1,169 字符；HTML 有两个 PRE、一张 data:image 图片和 156 处内联样式。未粘贴到公众号，不能证明目标阅读端保真。

两名子代理分别复核原站核心事实与仓库适配；修正章节头像 PNG、普通文字块行高的限定。截图已实际查看，下载产物 hash 已核验。

本轮文档执行格式、相对链接、归档 CI 和 Git diff 检查。中间归档 CI 因报告提前引用未移动的两个目标报 DUE，计划声明 Platform 文档归档审查并完成移动/链接修复，最终重新验证。没有运行 Cyber-Sight 前端自动化或浏览器测试；业务代码无变化，不运行构建与后端测试。

最终结果：`pnpm format`、`pnpm format:check`、`git diff --check` 通过；7 份 Markdown 共 180 条本地链接有效；`pnpm docs:archive:check:ci` 为 NOT_DUE。

## 未决问题与下一步

目标依赖精确版本、源码许可证、公众号实际粘贴保真和图片接收行为尚未核实；未来实施应先验证转换闭环。

## 相关设计、ADR、计划和提交

- [调研报告](../../../../../design/wechat-editor-research.md)
- [本轮调研与文档归档计划](../../../../plans/2026-10-04-wechat-editor-research.md)
- 关联提交为包含本文件的 `docs(platform): add WeChat editor research report`，精确 SHA 以 Git 记录为准。提交 trailer 的模型名称依据当前会话 turn_context 核实为 `gpt-6.1-sol`。
