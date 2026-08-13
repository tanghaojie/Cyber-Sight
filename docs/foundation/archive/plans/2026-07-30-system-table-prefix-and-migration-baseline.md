---
title: 系统表前缀与迁移基线重构实施计划
status: completed
created: 2026-07-30
updated: 2026-07-30
---

# 系统表前缀与迁移基线重构实施计划

## 目标

将全部框架表改为 `sys_` 物理前缀，把十条 Drizzle 迁移压缩为一条可在空 PostgreSQL 数据库完成最终建表和初始化的基线。

## 背景与设计依据

维护者明确接受旧数据库不可原地升级，并要求开发与运维改用全新数据库。正式边界见数据库设计和 ADR-0026。

## 范围

- Drizzle Schema 中 14 张表的物理名、约束和索引名。
- 单一迁移 SQL、snapshot 和 journal。
- 初始管理员、权限、菜单、部门、字典和授权种子。
- Schema/迁移测试、数据库检查命令和开发运维说明。
- 当前设计、ADR、目录索引与 AI 协作记录。

## 非目标

- 旧数据库表重命名、数据迁移、备份恢复或双写。
- 修改列名、HTTP 契约、业务模块名或 PostgreSQL 枚举名。
- 新增业务能力或前端行为。

## 前置条件和风险

- 任务开始时暂存区已确认为空，工作区无既有未提交改动。
- 压缩后的迁移历史与旧 journal 不兼容，验证数据库必须是空库。
- 初始数据必须从最终结构直接写入，不能依赖已删除的菜单 `code` 列。

## 实施任务

- [x] 盘点 Schema、十条迁移、测试和当前文档。
- [x] 创建设计、ADR、计划和 AI 协作记录。
- [x] 更新 14 张表及其对象命名。
- [x] 重新生成并审查单一 `0000` 基线，补齐最终种子数据。
- [x] 更新 Schema/迁移测试、`test:db` 和维护者操作说明。
- [x] 完成格式、lint、测试、构建和真实空库验证。
- [x] 更新最终记录并归档计划和 AI 日志。
- [x] 准备带真实模型 trailer 的本次交付提交并在提交后复核。

## 测试与验证

- `pnpm format`：通过。
- `pnpm lint`：通过。
- 后端定向测试：2 个文件、47 项通过。
- `pnpm test`：契约构建通过，后端 11 个文件、98 项通过；前端按仓库边界未创建或运行自动化测试。
- `pnpm build`：契约、后端和前端生产构建通过；现有 Sass deprecation 与动态/静态导入提示不影响构建结果。
- `pnpm db:generate -- --name=verify_no_schema_drift`：14 张表无 Schema 漂移，未生成额外迁移。
- 临时空 PostgreSQL 数据库：基线真实执行通过，创建 14 张系统表、1 条迁移记录，全部预期种子行数通过；验证后临时数据库已删除。
- `pnpm format:check`、Markdown 链接、`git diff --check` 与最终差异：提交前复核通过。

## 发布与回滚

发布前创建新数据库并切换 `DATABASE_URL`。代码回滚时同时切回旧应用及旧数据库；新旧迁移链不能混用。旧数据迁移需要独立方案。

## 实际偏差和遗留问题

- Drizzle Kit 0.23 在迁移目录存在但 journal 文件缺失时不会自动初始化，且 pnpm 将该内部错误表现为退出码 0；先创建零条目 journal 后重新生成成功。
- Vitest/esbuild 在 Windows 沙箱中因上级目录访问限制无法加载配置；在授权环境重跑定向与全量测试后全部通过。
- 无功能遗留。前端无行为改动，未增加或运行前端自动化测试。

## 相关设计、ADR 和 AI 日志

- [数据库 Schema 与迁移基线](../../design/database-schema-and-migrations.md)
- [ADR-0026](../../decisions/ADR-0026-system-table-prefix-and-fresh-baseline.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-30-system-table-prefix-and-migration-baseline.md)
- 关联提交：本次交付提交 `refactor(db)!: reset system table baseline`。
