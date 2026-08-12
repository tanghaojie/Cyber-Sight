---
title: 菜单编码软删除唯一性修复
date: 2026-07-27
status: completed
---

# 菜单编码软删除唯一性修复

## 用户目标和约束

用户调试发现 `menus.code` 的全表唯一约束会阻止软删除后重新创建同编码菜单，要求修复。
任务遵守仓库暂存区门禁、文档门禁、验证和 AI 自动提交规则。

## 关键问答与确认

无需新增 API 或改变前端交互。现有设计已明确软删除后自然键应可复用，用户报告与代码、
迁移中的 `menus_code_unique` 一致。

## AI 的重要假设

- 相同编码只需要在未删除菜单之间唯一。
- 应保留原软删除记录及编码，不能通过改写历史记录规避约束。
- 本次只处理用户明确指出的菜单表，不顺带扩大到其他业务表。

## 方案和执行摘要

选择 PostgreSQL 部分唯一索引 `menus_code_active_unique`，索引列为 `code`，条件为
`is_deleted = false`。该方案比应用层预查更能保证并发安全，也避免
`(code, is_deleted)` 无法保留多条同编码软删除历史的问题。

## 验证结果

- 生成迁移 `0003_yummy_dexter_bennett.sql`，仅删除旧全表唯一约束并新增
  `menus_code_active_unique` 部分唯一索引。
- 后端 43 项测试、前端 29 项测试和 API 契约类型检查全部通过。
- API 契约、后端和前端生产构建全部通过。
- 本地 PostgreSQL 18.4 迁移成功。
- 回滚事务验证未删除重码返回 `23505`，菜单软删除后可两次复用相同编码，且没有留下
  测试数据。

## 未决问题与下一步

本次范围内无未决问题。其他业务表的自然键复用策略待对应模块后续实质修改时审查。

## 相关设计、ADR、计划和提交

- [菜单模块设计](../../../../design/modules/menus.md)
- [ADR-0014](../../../decisions/ADR-0014-soft-delete-natural-key-uniqueness.md)
- [实施计划](../../../plans/2026-07-27-menu-code-soft-delete-uniqueness.md)
- 关联提交：本记录所在的 `fix: allow reusing soft-deleted menu codes` 提交。
