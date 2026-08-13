---
title: 集中前后端环境文件目录
scope: foundation
repository: Cyber-AI-Forge
status: completed
type: implementation
created: 2026-08-13
updated: 2026-08-13
---

# 集中前后端环境文件目录

## 目标

将前后端分散在 workspace 根目录的环境示例与本地配置统一放入 `apps/backend/env/` 和 `apps/frontend/env/`，保留 Foundation/Platform 分层与 Integration 聚合，不改变环境变量名称和优先级。

## 实施步骤

- [x] 移动前后端环境示例文件到各自 `env/` 目录。
- [x] 更新后端分层加载器、前端 Vite `envDir` 与配置文档。
- [x] 更新 README、Forge 同步清单、维护指南和相关索引。
- [x] 运行格式、Lint、测试、构建、架构检查和归档审计。
- [x] 归档本计划与 AI 协作记录，记录提交和实际验证结果。

## 边界与兼容性

保留 `.env`、`.env.local`、`.env.foundation.local`、`.env.platform.local` 的加载顺序；仅改变文件所在目录。部署环境仍可直接注入进程环境变量，不创建数据库迁移。

## 相关设计

- [分层运行时配置](../../design/runtime-configuration.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-13-env-directory.md)
- 实际验证：`pnpm format:check`、`pnpm lint`、`pnpm test`、`pnpm build`、`pnpm architecture:check` 和 `pnpm docs:archive:check:ci` 均通过。
