---
title: 统一软删除业务唯一性约束
status: completed
created: 2026-07-27
updated: 2026-07-27
---

# 统一软删除业务唯一性约束

## 目标

把菜单修复推广到所有当前可复用业务身份，使用户、角色、字典和业务关联关系均只在
未删除记录中唯一，同时保留会话令牌的全表安全唯一性。

## 背景与设计依据

用户确认其他表存在同类问题。依据
[ADR-0015](../decisions/ADR-0015-active-row-business-uniqueness.md)，业务自然键和关联组合
使用部分唯一索引，不可复用安全标识保持全表唯一。

## 范围

- 用户名、用户邮箱、角色编码的全表唯一约束。
- 用户角色、角色菜单、字典类型+值的联合唯一索引。
- Schema、迁移、回归测试和真实 PostgreSQL 行为验证。
- 用户、角色、字典、认证和管理系统设计文档。

## 非目标

- 不改变 HTTP 契约、错误码或前端交互。
- 不修改 `auth_sessions.token_hash` 的全表唯一约束。
- 不清理、合并或恢复现有软删除数据。

## 前置条件和风险

- 现有约束保证新部分唯一索引建立时不存在未删除业务身份冲突。
- 回滚全表约束前可能需要清理迁移后产生的重复历史身份。
- 本地数据库迁移和事务验证不得留下测试数据。

## 实施任务

- [x] 更新设计文档、ADR、实施计划和 AI 协作记录。
- [x] 调整所有可复用业务身份的 Drizzle 部分唯一索引。
- [x] 生成并审查迁移 SQL 和 Drizzle 元数据。
- [x] 扩展 Schema 与迁移回归测试。
- [x] 应用迁移并执行真实数据库回滚事务验证。
- [x] 运行全仓测试和构建，归档计划并创建带 AI trailer 的提交。

## 测试与验证

- Schema 测试逐项断言七个业务身份索引及会话令牌例外。
- 迁移测试断言旧约束/索引全部删除，新部分唯一索引全部创建。
- PostgreSQL 事务验证每类身份：未删除重码失败、软删除后复用成功、再次软删除后仍可复用。
- `pnpm test`、`pnpm build`、`pnpm db:generate` 无漂移。

实际验证结果：

- `pnpm test` 通过：后端 51 项、前端 29 项，API 契约 TypeScript 校验通过。
- `pnpm build` 通过：API 契约、后端和前端生产构建全部成功。
- `pnpm db:migrate` 成功应用 `0004_overconfident_dakota_north.sql`。
- `pnpm db:generate` 确认 Schema 无迁移漂移。
- PostgreSQL 回滚事务验证七类行为：用户名、邮箱、角色编码、字典组合、用户角色和角色菜单
  均在未删除重码时返回 `23505`，连续两次软删除后仍可复用；会话令牌软删除后仍返回
  `23505`。事务最终回滚，未留下测试数据。

## 发布与回滚

发布时执行新 Drizzle 迁移。回滚前扫描重复历史身份；确认可恢复全表唯一后，删除部分
索引并按旧名称恢复约束/索引。

## 实际偏差和遗留问题

首次会话令牌 Schema 测试试图从 `getTableConfig().uniqueConstraints` 读取列内联唯一约束，
但当前 Drizzle 运行时不在该数组暴露内联约束；改为直接断言 `tokenHash.isUnique` 和
生成约束名后通过，不影响实现。

没有遗留功能问题。后续新增带软删除的业务唯一身份时必须遵守 ADR-0015，并在模块设计
中显式区分可复用业务身份与不可复用安全标识。

关联提交：本计划归档所在的 `fix: align soft-delete unique constraints` 提交。

## 相关设计、ADR 和 AI 日志

- [管理系统基础能力设计](../design/management-system.md)
- [ADR-0015](../decisions/ADR-0015-active-row-business-uniqueness.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-27-soft-delete-unique-constraints.md)
