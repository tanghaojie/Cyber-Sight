---
title: UUIDv7 单一标识符与空库基线实施
date: 2026-08-10
status: completed
---

# UUIDv7 单一标识符与空库基线实施

## 用户目标和约束

用户明确要求直接实施 UUID 改造，不使用双 ID，并允许重新建立空数据库基线。实施必须保持单一 ID 模型，避免兼容层增加维护和阅读负担。

## 关键决定

- PostgreSQL 最低版本为 18，数据库原生生成 UUIDv7。
- 所有应用表主键和实体引用统一为 UUID 字符串。
- 菜单、部门根节点和系统审计操作者使用 `null`，不使用 nil UUID。
- 现行迁移链重建为单一 `0000`，旧数据库和旧客户端不兼容。

## 执行摘要

完成共享契约、17 张应用表、后端认证授权链路和前端 ID 流的 UUID 字符串迁移；数据库主键统一由 PostgreSQL 18 原生 `uuidv7()` 生成。菜单与部门根节点、系统审计操作者改为 `null`，JWT `sub`、授权主体、数据范围和关联集合全部使用 UUID。

旧 `0000` 至 `0005` 迁移链、journal 和 snapshot 被一条最终态 `0000` 空库基线取代，种子通过业务唯一键与 `RETURNING` 获取 UUID，不硬编码环境 ID。数据库检查增加 PostgreSQL 18、17 张 UUIDv7 主键表、34 个 UUID 审计列、种子和根节点语义验证。

`/admin/authorization/users/:id` 的用户数据范围保护继续生效；UUID 只降低 ID 枚举便利性，不替代功能权限和数据范围授权。

验证结果：`pnpm test` 通过（16 个测试文件、140 个测试），`pnpm build`、`pnpm lint` 和隔离既有人类文件后的 `pnpm format:check` 通过；同一归档审计脚本以 `--fail-on-due` 运行得到 `NOT_DUE`。默认 pre-commit 在 Windows 上触发命令行长度限制，改用 `pnpm exec lint-staged --max-arg-length 4000` 执行相同任务后通过。在任务专用 PostgreSQL 18.4 空库中完成迁移和数据库检查，随后删除临时容器。

偏差：未兼容旧数字数据库、旧 JWT 和旧浏览器标签页缓存，符合用户确认；前端交互留给维护者人工验收。全仓未隔离格式检查仅报告任务开始前的两份人类文章草稿，未改写这些文件。关联提交为本记录归档所在的 UUIDv7 基线提交。

## 未决问题

当前没有未决问题。

## 相关文档

- [设计](../../../../design/uuid-identifier-model.md)
- [ADR-0039](../../../../decisions/ADR-0039-single-uuidv7-identifiers.md)
- [计划](../../../plans/2026-08-10-uuidv7-identifier-baseline.md)
