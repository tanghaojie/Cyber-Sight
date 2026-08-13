---
title: 集中前后端环境文件目录
scope: foundation
repository: Cyber-AI-Forge
status: completed
date: 2026-08-13
---

# AI 协作记录：集中前后端环境文件目录

## 用户目标

用户指出前后端环境文件数量增加，要求分别建立 `env/` 目录集中存放。

## 方案

在 `apps/backend/env/` 与 `apps/frontend/env/` 中保留 Foundation/Platform 示例和本地配置；后端加载器显式读取 backend `env/`，Vite 使用 frontend `env/` 作为 `envDir`。变量名称、分层所有权和覆盖优先级保持不变。

## 重要假设

部署环境继续通过进程环境变量提供密钥和运行参数；本地 `.local` 文件不纳入 Git。

## 当前状态

已完成目录迁移、加载器和文档更新；格式、Lint、测试、构建、架构检查和归档审计均通过。

## 相关计划

- [实施计划](../../../plans/2026-08-13-env-directory.md)
- 实现提交：`e8bc4b76a17cddefb83c76eb705100f71ac6bdb4`
