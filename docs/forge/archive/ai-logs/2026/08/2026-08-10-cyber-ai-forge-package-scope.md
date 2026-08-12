---
title: Cyber AI Forge workspace 包作用域迁移
status: completed
date: 2026-08-10
---

# AI 协作记录

## 用户目标

用户确认已拥有 npm scope `@cyber-ai-forge`，要求将项目内所有 `@scaffold/*` workspace 包作用域迁移为 `@cyber-ai-forge/*`。

## 关键指令与假设

- 包后缀 `api-contract`、`backend`、`frontend`、`website` 保持不变。
- 仅迁移当前代码和现行文档；`docs/archive/**` 作为历史证据保留原文。
- 不改变目录、GitHub URL、HTTP API、数据库、运行时行为或品牌键。

## 方案选择

采用与根包 `cyber-ai-forge` 一致的 npm scope，并更新 ADR-0031 使当前设计描述最终事实。

## 实际改动

已更新四个 workspace 包的 package name、根脚本、部署 workflow、锁文件、后端/前端源码和测试导入，以及现行设计、指南和 ADR。目录、GitHub URL、HTTP API、数据库和运行时品牌标识未变更；历史归档未改写。

## 验证结果

归档审计已通过，结果为 `NOT_DUE`。`pnpm format`、`pnpm format:check`、`pnpm docs:archive:check:ci`、`pnpm build` 和 `pnpm test` 均通过；后端 126 项测试通过。首次构建因旧 workspace 链接失败，刷新 `pnpm install` 后通过。静态搜索确认当前实现无旧 scope 引用。

## 未决问题

无；公开发布包时需另行确认 npm 发布权限和访问策略。
