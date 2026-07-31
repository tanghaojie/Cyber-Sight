---
title: 移除角色编码
status: completed
created: 2026-07-31
updated: 2026-07-31
---

# 移除角色编码

## 目标

从角色数据模型、角色管理接口与界面、认证身份快照及初始数据库基线中移除 `roleCode`；顶部栏展示当前用户的全部角色名称。

## 背景与设计依据

角色授权、用户归属和数据策略均以 `roleId` 关联，角色编码不参与运行时授权。角色名称是唯一需要面向用户展示的角色信息；认证快照应返回角色 ID 与名称，界面只显示名称。

## 范围

- 调整角色和认证共享 Zod 契约，以及相应前后端实现与测试。
- 从 `sys_roles`、初始迁移和 Drizzle 快照中删除 `code` 列及唯一索引。
- 移除角色管理中的编码输入、列表列和编码搜索，并同步现行设计文档。

## 非目标

- 不改变角色、权限和数据策略的 `roleId` 关联语义。
- 不新增主角色概念；顶部栏按稳定的角色 ID 顺序展示全部有效角色名称。
- 不提供旧数据库原地升级；仓库当前仅维护面向空数据库的单一初始基线。

## 前置条件和风险

- 认证响应结构为破坏性变更，所有当前调用方和测试必须在同一改动中迁移。
- 初始迁移不再以编码定位超级管理员角色，改为在空数据库基线中按初始角色名称定位。

## 实施任务

- [x] 确认角色编码不参与运行时授权，梳理契约、数据库和展示依赖。
- [x] 更新设计文档、共享契约和前后端角色/认证实现。
- [x] 重写初始基线与 Drizzle 快照，并更新后端测试。
- [x] 格式化、执行适用的测试、类型检查和构建，人工验收顶部角色名称展示。
- [x] 归档计划和 AI 协作记录，更新索引并提交。

## 测试与验证

- `pnpm format`
- `pnpm test`
- `pnpm build`
- `pnpm format:check`
- 维护者人工验收：登录拥有多个角色的用户，顶部栏应显示全部角色名称且不显示角色 ID 或编码。

实际结果：`pnpm test` 通过（100 项后端测试及共享契约构建）；`pnpm build`、`pnpm lint` 和 `pnpm format:check` 通过。未执行 `pnpm test:db`，因为未确认可安全使用的空 PostgreSQL 数据库；前端交互仍按项目边界交由维护者人工验收。

## 发布与回滚

该仓库当前只支持全新空数据库基线。发布时创建空 PostgreSQL 数据库并执行 `pnpm db:migrate`；回滚通过恢复上一版应用和匹配的空数据库基线完成。

## 实际偏差和遗留问题

无实现偏差。初始迁移仅在全新空库中通过初始角色名称定位其种子角色，不构成运行时特殊角色逻辑。

## 相关设计、ADR 和 AI 日志

- `docs/design/modules/auth.md`
- `docs/design/modules/roles.md`
- `docs/design/authorization-database-model.md`
- `docs/design/database-schema-and-migrations.md`
- `docs/archive/ai-logs/2026/07/2026-07-31-remove-role-code.md`
- 关联提交：`feat(roles): remove role codes`
