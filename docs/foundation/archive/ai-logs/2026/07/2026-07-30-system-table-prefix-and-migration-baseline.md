---
title: 系统表前缀与迁移基线重构协作记录
date: 2026-07-30
status: completed
---

# 系统表前缀与迁移基线重构协作记录

## 用户目标和约束

- 全部现有数据库表增加 `sys_` 前缀，表明其框架系统表属性。
- 合并全部现有迁移脚本。
- 明确开发者和运维人员必须使用全新数据库重建，不要求兼容旧库。

## 关键问答与确认

用户已经直接确认破坏性重建边界，无需设计旧库原地升级路径。

## AI 的重要假设

- “所有数据库表”指 14 张应用拥有的 PostgreSQL 表，不包括枚举类型和 Drizzle 内部迁移表。
- TypeScript 表导出名称、列名和业务资源键保持不变；表属约束与索引同步使用 `sys_` 命名。
- 合并迁移不仅合并 DDL，也必须保留新环境启动所需的最终初始数据。

## 方案和执行摘要

- 通过暂存区门禁并确认无既有未提交改动。
- 将 14 张 Drizzle 表及其外键、约束和索引改为 `sys_` 物理命名，保留 TypeScript 业务符号。
- 用最终 Schema 生成 `0000_initial_system_schema.sql`，只保留一份 snapshot 和一条 journal。
- 把旧迁移的最终初始化语义改写为直接面向最终结构的管理员、角色、权限、部门、菜单、字典和授权种子。
- 更新 Schema/迁移测试、数据库检查输出、数据库设计、ADR、模块文档、README 和全新数据库重建指南。

## 验证结果

- 格式、ESLint、契约构建、后端 98 项测试和全量生产构建通过。
- Drizzle 再次生成报告 14 张表无 Schema 变化，没有产生第二条迁移。
- 在专用临时空 PostgreSQL 数据库真实执行基线，确认 14 张 `sys_*` 表、1 条迁移记录及全部预期种子行数；随后删除临时数据库和临时验证脚本。
- 前端没有行为改动；依据仓库边界未创建或运行前端自动化测试。

## 未决问题与下一步

无实现遗留。部署者必须按重建指南创建全新数据库；旧数据迁移若有现实需求，应作为独立任务设计和验证。

## 相关设计、ADR、计划和提交

- [数据库 Schema 与迁移基线](../../../../design/database-schema-and-migrations.md)
- [ADR-0026](../../../../decisions/ADR-0026-system-table-prefix-and-fresh-baseline.md)
- [实施计划](../../../plans/2026-07-30-system-table-prefix-and-migration-baseline.md)
- 关联提交：本次交付提交 `refactor(db)!: reset system table baseline`。
