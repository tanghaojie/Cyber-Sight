---
title: 菜单编码软删除唯一性修复
status: completed
created: 2026-07-27
updated: 2026-07-27
---

# 菜单编码软删除唯一性修复

## 目标

修复菜单软删除后无法重新创建相同 `code` 的数据库约束错误，同时保持所有未删除菜单
编码唯一。

## 背景与设计依据

`menus.code` 当前是全表唯一约束，而菜单删除只更新 `is_deleted`。依据
[菜单模块设计](../../design/modules/menus.md)和
[ADR-0014](../decisions/ADR-0014-soft-delete-natural-key-uniqueness.md)，应使用只覆盖
未删除记录的部分唯一索引。

## 范围

- 调整 Drizzle 菜单表 Schema。
- 生成并审查数据库迁移。
- 增加 Schema 与迁移回归测试。
- 更新菜单、管理系统、ADR 和协作文档。
- 在可用的本地 PostgreSQL 上迁移并验证实际约束行为。

## 非目标

- 不改变菜单 HTTP 契约或前端页面。
- 不批量调整用户、角色、字典或关联表的唯一约束。
- 不自动恢复或清理已有软删除菜单。

## 前置条件和风险

- 迁移前旧全表唯一约束保证现有数据没有重复编码，新索引可直接建立。
- 数据库迁移需要本地 `DATABASE_URL` 指向可验证的 PostgreSQL。
- 唯一冲突仍沿用现有 `23505` 业务冲突映射，不新增错误码。

## 实施任务

- [x] 更新设计文档、ADR、实施计划和 AI 协作记录。
- [x] 将 `menus.code` 改为 `is_deleted = false` 条件唯一索引。
- [x] 生成并审查迁移 SQL 和 Drizzle 元数据。
- [x] 增加 Schema/迁移测试并执行项目验证。
- [x] 迁移本地数据库并验证软删除编码复用行为。
- [x] 补充最终结果，归档计划并创建带 AI trailer 的提交。

## 测试与验证

- 后端 Schema 测试断言 `menus_code_active_unique` 是仅覆盖 `code` 的条件唯一索引。
- 迁移测试断言删除 `menus_code_unique` 并创建 `WHERE is_deleted = false` 的唯一索引。
- `pnpm test` 与 `pnpm build` 全部通过。
- 本地数据库迁移后：同编码未删除菜单写入失败；旧记录软删除后同编码写入成功。

实际验证结果：

- `pnpm test` 通过：后端 43 项、前端 29 项，API 契约 TypeScript 校验通过。
- `pnpm build` 通过：API 契约、后端和前端生产构建全部成功。
- `pnpm db:migrate` 成功应用 `0003_yummy_dexter_bennett.sql`。
- PostgreSQL 回滚事务验证：未删除重码返回 `23505`；连续两次软删除后均能复用相同
  `code`；验证事务最终回滚，未留下测试数据。

## 发布与回滚

发布时正常执行 Drizzle 迁移。回滚需先确认没有多条同编码记录，再删除部分索引并恢复
全表唯一约束；若已产生重复软删除历史，回滚前必须人工决定数据保留策略。

## 实际偏差和遗留问题

首次 Schema 测试把 Drizzle 的索引列配置对象与表列对象直接深比较，因两者运行时类型
不同而失败；改为断言索引列名后通过，不影响实现。Vitest/Vite 在 Codex 沙箱内仍受
Windows 上级目录读取限制，依照既有验证方式在获批的沙箱外完成测试与构建。

没有遗留功能问题。用户、角色和字典等其他自然键的软删除复用策略不在本次范围内，
后续触及对应模块时按 ADR-0014 逐项审查。

关联提交：本计划归档所在的 `fix: allow reusing soft-deleted menu codes` 提交。

## 相关设计、ADR 和 AI 日志

- [菜单模块设计](../../design/modules/menus.md)
- [ADR-0014](../decisions/ADR-0014-soft-delete-natural-key-uniqueness.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-27-menu-code-soft-delete-uniqueness.md)
