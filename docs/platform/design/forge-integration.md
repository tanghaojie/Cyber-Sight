---
title: Cyber-Sight Forge 集成与下游所有权
status: accepted
scope: platform
owner: project maintainers
updated: 2026-08-14
---

# Cyber-Sight Forge 集成与下游所有权

Cyber-Sight 以 Cyber AI Forge 的 Foundation 为共享工程基线，在 Platform 作用域维护产品品牌、业务模块、产品契约、数据库迁移和产品文档。

## 所有权边界

- `foundation/` 接收 Forge 的通用认证、授权、管理能力、运行时、契约基础、数据库基础和验证工具。
- `platform/` 保留 Cyber-Sight 的产品品牌、环境配置、产品模块、产品契约、业务 Schema、迁移和产品文档。
- `forge/` 不进入 Cyber-Sight；Forge 官网和 Forge 专属文档留在上游仓库。
- 根目录 README、工作区组装文件和入口配置属于 integration，必须逐项审查。

## 当前迁移策略

本次同步从 Forge `c97d184` 合并。Foundation 代码采用上游实现；Cyber-Sight 的 README 和产品文档保留当前内容，并迁入 `docs/platform/`。数据库按 Foundation 先于 Platform 的独立迁移链运行；当前 Sight 仍以全新 PostgreSQL 数据库为基线。

## 验证边界

架构检查、同步规则测试、共享契约构建、后端测试、格式检查、Lint、生产构建和文档归档检查由自动化完成。`pnpm test:db` 需要维护者提供 PostgreSQL 18 连接和 Foundation 安全环境变量；前端浏览器行为、Swagger 展示、登录/导航和品牌视觉由维护者人工验收。

## 2026-08-13 实际结果

- Forge 上游基线：`c97d184c439b8dc0378828bf386a3cc6e6a3c673`。
- 自动化：同步规则、ownership、格式、Lint、契约构建、后端 143 项测试、全工作区生产构建和归档 CI 通过。
- 文档：Sight 产品文档统一迁入 `docs/platform/`，旧 `docs/design/`、`docs/decisions/`、`docs/guides/`、`docs/archive/` 产品路径已移除；Forge 官网和 `docs/forge/` 未进入下游。
- 产品入口：已移除下游推广站、英文 README 和 GitHub Pages 工作流；README 不再引用这些资源。
- 数据库：已连接本地 `cyber-sight` 测试库，PostgreSQL 18.4、17 张应用表、Foundation/Platform 迁移表和 UUIDv7 检查通过。
- 关联提交：`a23c38240d7d71f1aa5eb36438ffeda59c5f5355`。
