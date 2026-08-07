---
title: 移除岗位编码设计字段
status: completed
type: design-revision
scope: system/positions
created: 2026-08-07
updated: 2026-08-07
---

# 移除岗位编码设计字段

## 目标

根据维护者确认，从岗位管理设计、数据库模型和 ADR 中移除岗位编码，不保留隐藏字段或编码唯一性约束。

## 范围

- 更新岗位模块设计、数据库 Schema 设计补充和岗位组织归属 ADR。
- 保留部门内岗位名称唯一性、软删除和审计约束。
- 更新本次修订的 AI 协作记录并归档。

## 非目标

- 不创建或修改业务代码、Zod Schema、Drizzle Schema、SQL migration 或页面。
- 不改变岗位按单部门归属、用户多岗位或岗位不参与授权的既有设计。

## 验证

- `rg` 确认岗位设计范围不再出现岗位编码字段或编码唯一性规则。
- `pnpm format`
- `pnpm format:check`
- `git diff --check`

实际结果：岗位现行设计、数据库设计补充和 ADR 已不再包含岗位编码字段或编码唯一性规则；`pnpm format`、`pnpm format:check` 和 `git diff --check` 均通过。归档检查命令仍受默认 Node 运行环境对 `C:\Users\thj_3` 的 `EPERM` 限制。

## 未决问题

无。岗位使用部门范围内唯一的岗位名称作为管理识别信息；若未来需要外部稳定标识，应另行设计。
