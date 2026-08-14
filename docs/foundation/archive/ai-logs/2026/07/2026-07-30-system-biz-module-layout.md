---
title: 前后端系统与业务模块分层及 Header 紧凑化
date: 2026-07-30
status: completed
---

# 前后端系统与业务模块分层及 Header 紧凑化

## 用户目标和约束

- 把前后端现有模块统一整理到新建的 `modules/system/`。
- 在前后端 `modules/` 下新建 `biz/`，为后续业务模块预留位置。
- 缩小 `AdminLayout` Header 的整体高度。
- 遵守仓库文档门禁、前端人工验收边界和自动提交要求。

## 关键问答与确认

用户未指定具体像素或要求契约包迁移；本轮按最小且完整的前后端范围实施。

## AI 的重要假设

- `packages/api-contract` 不属于本次“前后端”目录迁移范围，保持公共契约路径不变。
- 现有模块全部是脚手架内置系统能力，统一归入 `system`。
- Header 从 `96px` 调整为 `72px`，足以明显降低占比并容纳现有 44px 菜单按钮和标题组。
- `biz` 使用 README 持久保留，避免 Git 丢弃空目录。

## 方案和执行摘要

- 先更新系统概览、模块边界、前后端设计和维护指南，并新增 ADR-0027。
- 已把 11 个前端模块和 8 个后端模块迁入 `modules/system/`，并在两端创建 `modules/biz/README.md`。
- 已更新应用入口、模块间依赖、后端测试导入和维护指南；页面发现限定为 `system` 与 `biz` 两类。
- 已把 Header 高度从 `96px` 调整为 `72px`，未改动粘性定位、响应式交互或用户菜单。

## 验证结果

- `pnpm format`、`pnpm format:check`、`pnpm lint` 通过。
- API 契约、后端和前端生产构建通过。
- 后端 11 个测试文件、99 项测试通过。
- 旧前后端模块导入无残留，目录分类、Markdown 链接和 `git diff --check` 通过。
- 后端测试与前端构建首次受 Windows 沙箱访问限制失败；获准原命令重跑后通过。

## 未决问题与下一步

没有阻塞性未决问题。Header 视觉比例仍需维护者人工验收；按仓库边界未运行前端自动化或浏览器测试。

## 相关设计、ADR、计划和提交

- [模块边界](../../../../design/module-boundaries.md)
- [前端应用与应用壳](../../../../design/modules/frontend.md)
- [后端模块设计](../../../../design/modules/backend.md)
- [ADR-0027](../../../../decisions/ADR-0027-system-and-business-module-classification.md)
- [实施计划](../../../plans/2026-07-30-system-biz-module-layout.md)
- 提交：`refactor: classify system modules and compact header`
