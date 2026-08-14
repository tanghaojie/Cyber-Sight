---
title: ADR 日期命名规则
date: 2026-08-11
status: completed
---

# ADR 日期命名规则

## 用户目标和约束

用户要求将新增 ADR 文件名改为 `ADR-YYYYMMDD-<topic>.md`，避免多人同步工作时顺序编号重叠；要求同步排查其他文档，并在明确范围前不开始修改。

## 关键问答与确认

- 用户确认：既有 ADR 文件名不改名。
- 用户确认：既有引用保持现状。
- 本任务因此只更新新规则、模板、校验逻辑和新增 ADR；新增引用使用日期命名 ADR。

## AI 的重要假设

- 新 ADR 的日期使用 frontmatter 中的创建/接受日期；文件名日期与该字段一致。
- `<topic>` 使用小写 kebab-case，并承担同日 ADR 的唯一性。
- 既有数字 ADR 文件需要继续被归档审计识别，否则历史 accepted/superseded 状态会从统计中消失。

## 方案和执行摘要

只读排查确认计划和 AI 日志已经使用日期命名，未发现其他文档存在同类顺序号文件名规则。保留既有 ADR 路径可避免批量改写约 115 个 Markdown 文件中的历史引用和外部链接；新规则通过治理设计、入口、索引、模板、审计脚本和一份新 ADR 固化。

## 验证结果

前置 `git diff --cached --quiet` 通过。前置 `pnpm docs:archive:check` 返回 `NOT_DUE`。最终 `pnpm format`、`pnpm format:check`、`pnpm docs:archive:check` 和 `pnpm docs:archive:check:ci` 均通过；40 个 ADR 文件全部匹配兼容格式，其中 39 个为旧格式、1 个为新格式。

## 未决问题与下一步

无。计划和本记录归档后提交带真实模型 trailer 的 Git 提交。

## 相关设计、ADR、计划和提交

- [分层文档与历史归档](../../../../design/documentation-governance.md)
- [ADR 日期命名规则](../../../../decisions/ADR-20260811-adr-filename-convention.md)
- [实施计划](../../../plans/2026-08-11-adr-filename-convention.md)

关联提交：本任务提交。
