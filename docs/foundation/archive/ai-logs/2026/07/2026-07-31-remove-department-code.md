---
title: 移除部门编码
date: 2026-07-31
status: completed
---

# 移除部门编码

## 用户目标和约束

用户确认不考虑对接外部系统，要求直接删除部门编码。

## 关键问答与确认

- 当前部门树通过 `parentId` 与 `sys_department_closure` 表达，用户归属和数据策略通过 `departmentId` 关联。
- 部门编码只服务于当前管理表单、列表、搜索和初始基线种子定位，不参与运行时授权或范围判断。

## AI 的重要假设

- 仓库文档声明当前只维护面向全新空数据库的单一初始基线，因此本次同步更新 `0000` 初始迁移及其唯一快照，而不添加旧库升级迁移。
- 初始部门名称可作为空数据库基线中定位默认部门的条件；该条件不构成运行时特殊部门逻辑。

## 方案和执行摘要

移除了 `DepartmentSummary`、`DepartmentRequest` 和 `DepartmentOption` 的 `code` 字段，以及后端仓储投影、`sys_departments.code`、对应唯一索引和初始 SQL 中的 `DEFAULT` 种子编码。部门管理界面不再录入或展示编码，树搜索仅匹配名称。

层级、用户部门归属和数据策略继续使用 `departmentId`；没有把名称作为运行时关系或授权依据。初始 SQL 中按“默认部门”名称的条件仅用于空数据库基线写入后取得种子行。

## 验证结果

`pnpm format` 通过；`pnpm test` 通过（共享契约构建完成，后端 100 项测试通过）；`pnpm build` 通过；`pnpm lint` 和 `pnpm format:check` 通过。构建输出仅包含现有 Dart Sass 旧 API 与 Rollup 纯注释警告。未运行数据库集成测试：当前没有可确认安全使用的空 PostgreSQL 数据库。

## 未决问题与下一步

前端自动化测试不在仓库维护范围；请维护者人工验收部门新增/编辑、按名称搜索、上级部门选择、用户部门选择和数据策略部门选择。无其他未决问题。

## 相关设计、ADR、计划和提交

- `docs/archive/plans/2026-07-31-remove-department-code.md`
