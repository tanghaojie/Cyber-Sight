---
title: Forge 架构更新接入 Cyber-Sight
status: completed
scope: platform
created: 2026-08-13
updated: 2026-08-13
---

# Forge 架构更新接入 Cyber-Sight

## 目标

将 Cyber AI Forge `c97d184` 的 Foundation/Platform/Forge 所有权架构接入 Cyber-Sight，同时保留 Sight 品牌、官网、产品文档和下游演进边界。

## 范围

- 合并 Forge `c97d184` 并保留共同 Git 历史。
- 接受 Foundation 路径、契约、环境配置和数据库迁移拆分。
- 将 Sight 产品文档迁移到 `docs/platform/`。
- 排除 `forge/` 官网和 Forge 专属文档。
- 修复 Sight 品牌、入口组装、Platform 配置和同步清单。

## 验证

- [x] `pnpm forge:sync:test`
- [x] `pnpm architecture:check`
- [x] `pnpm format` 和 `pnpm format:check`
- [x] `pnpm lint`
- [x] `pnpm test`：契约构建通过，后端 17 个测试文件、143 项测试通过
- [x] `pnpm build`：官网、契约、后端和前端生产构建通过
- [x] `pnpm docs:archive:check:ci`：归档审查计划已接续，链接检查通过
- [ ] `pnpm test:db`：本机未提供 `DATABASE_URL`/`JWT_SECRET`，未能连接真实 PostgreSQL
- [ ] 维护者人工验收前端、Swagger 和官网

## 实际结果与遗留边界

Foundation 代码、契约和迁移目录已接入；Cyber-Sight 官网、品牌、产品模块和历史文档已保留在 Platform。Forge 官网及 `docs/forge/` 未进入本仓库。数据库自动检查只完成了迁移测试与配置/构建验证，真实 PostgreSQL 连接、登录/导航/品牌视觉、Swagger 和官网发布仍需维护者人工验收。
