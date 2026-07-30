---
title: 部门模块
status: active
owner: maintainers
updated: 2026-07-30
---

# 部门模块

## 背景与目标

`departments` 提供可管理的组织树和用户部门归属，为数据权限解析提供稳定的部门、祖先和后代关系。用户拥有一个主部门，并可属于多个附属部门。

## 范围与非目标

模块包括部门树 CRUD、部门闭包关系、部门选项 API、管理页面以及用户部门上下文查询。第一版不实现岗位、部门负责人、组织租户、虚拟团队或跨组织关系。

## 职责与边界

- `departments` 拥有部门记录和 `department_closure`。
- `users` 拥有用户与部门的归属关系 `user_departments`，并保证每个有效用户恰有一个主部门。
- `authorization` 只能通过本模块公开的部门上下文和后代查询消费组织关系，不修改部门树。
- 部门管理页面编辑本模块数据，并通过 authorization 公共 API 编辑该部门作为授权主体的数据策略。

## 公共接口

- HTTP：`GET/POST /admin/departments`、`PUT/DELETE /admin/departments/{id}`、`GET /admin/departments/options`。
- 后端公共文件：`departments.route.ts`、`departments.repository.ts`、`departments.access.ts`。
- 前端公共文件：`departments.api.ts`、`registerViews.ts`。
- 契约：`DepartmentSummary`、`DepartmentRequest`、部门列表和选项响应。

## 数据模型与数据流

`departments` 保存 `parent_id`、稳定编码、名称、排序、启用状态及生命周期字段。根节点使用 `parent_id = 0`。

`department_closure` 保存 `(ancestor_id, descendant_id, depth)`，包含每个有效部门到自身的深度 0 记录。创建和移动部门在事务中重建有效闭包；软删除部门时同步软删除涉及该部门的闭包关系。

创建或更新拒绝自引用、父节点不存在、父节点禁用以及把部门移动到自己的后代。存在有效子部门、有效用户归属或自定义数据策略引用时禁止删除。

## 依赖关系

`departments` 依赖数据库和共享 HTTP 能力；删除校验通过 `users.access.ts` 和 `authorization.references.ts` 检查成员与策略引用。`users` 通过部门选项 API 选择归属；`authorization` 通过 `departments.access.ts` 获取候选部门的有效 ID、祖先和后代。

## 失败模式与安全考虑

- 部门编码只在有效记录中唯一，软删除后允许复用。
- 无法构成完整无环树时事务回滚，不留下部分闭包。
- 禁用部门不会参与新授权决策，但历史归属保留。
- 部门选项只向具备用户、角色或部门管理权限的已认证用户开放；存在子部门、有效用户归属或自定义策略引用时拒绝删除。

## 测试与验证策略

后端测试覆盖闭包构建、循环拒绝、软删除约束、有效编码唯一性和公共查询；前端树表格、父部门选择、策略弹窗和窄屏布局由维护者人工验收。

## 兼容性与迁移

迁移创建一个启用的“默认部门”根节点，为所有存量有效用户建立主部门归属和闭包自关系，保证启用数据权限时不存在无组织用户。

## 未决问题

无。

## 相关 ADR、计划和 AI 日志

- [ADR-0025](../../decisions/ADR-0025-pluggable-authorization-and-data-scope.md)
- [授权模块](authorization.md)
- [实施计划](../../archive/plans/2026-07-30-pluggable-authorization.md)
- [AI 协作记录](../../archive/ai-logs/2026/07/2026-07-30-pluggable-authorization.md)
