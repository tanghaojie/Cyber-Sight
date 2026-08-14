---
title: Forge 架构更新接入 Cyber-Sight
status: completed
scope: platform
date: 2026-08-13
---

# Forge 架构更新接入 Cyber-Sight

## 用户目标

按评估建议，将 Forge 面向下游业务平台的架构更新接入 Sight。

## 关键假设

- 以本机干净 Forge 工作副本的 `c97d184` 作为上游基线。
- Sight 的品牌、官网、产品文档和业务内容由下游拥有。
- 用户确认将 Sight 现有文档迁移到 `docs/platform/` 并删除旧路径，不保留重复副本。

## 实施记录

- 已通过暂存区门禁和 `pnpm docs:archive:check`（NOT_DUE）。
- 已建立 `sync/forge-2026-08-13`，并打开 `--no-ff --no-commit` 合并。
- 已保留 Sight README、`apps/website` 和产品品牌；排除 Forge 官网和 `docs/forge/` 内容。
- 已将产品设计、ADR、指南、计划、AI 日志和历史归档迁入 `docs/platform/`，并恢复 Sight 的归档账本基线。
- 已修复默认品牌/API 元数据、Platform 配置、官网发布工作流和 `.forge-sync.yml` 所有权清单。

## 验证结果

- `pnpm forge:sync:test`、`pnpm architecture:check`、`pnpm format:check`、`pnpm lint`、`pnpm test` 和 `pnpm build` 通过。
- `pnpm docs:archive:check:ci` 在归档审查计划接续后通过；当前链接检查无失效项。
- `pnpm test:db` 因本机没有 `DATABASE_URL` 和 `JWT_SECRET` 未能建立 PostgreSQL 连接。
- 同步合并提交：`a23c38240d7d71f1aa5eb36438ffeda59c5f5355`，父提交保留 Sight `301e5fa` 与 Forge `c97d184`。

## 人工验收边界

维护者仍需验收前端浏览器行为、登录/导航/品牌视觉、Swagger 展示、官网预览与 Pages 发布；数据库真实连接和迁移执行也需在具备 PostgreSQL 18 环境后复核。
