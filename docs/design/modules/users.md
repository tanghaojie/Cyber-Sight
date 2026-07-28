---
title: 用户模块
status: active
owner: maintainers
updated: 2026-07-27
---

# 用户模块

## 职责与边界

`users` 拥有用户列表、创建、编辑、软删除、角色归属输入和独立用户管理页面。它不拥有角色或菜单规则，只保存角色 ID 并通过角色模块公共接口读取可选角色。

## 公共接口

- HTTP：`GET/POST /admin/users`、`PUT/DELETE /admin/users/{id}`。
- 前端公共文件：`view-registry.ts` 登记用户管理页面；`users.api.ts` 暴露用户管理 API。
- 契约：`UserSummary`、`UserCreate`、`UserUpdate` 及分页响应。

## 依赖、数据流与失败模式

`UsersPage.vue` 聚合 `pages/components/UsersList.vue` 与 `UserDialog.vue`。列表组件拥有分页、搜索、
错误和删除交互；Dialog 拥有创建/编辑表单、校验和保存，Page 只选择编辑对象并在保存后刷新列表。
组件仍经本模块 API service 调用后端，并只通过角色模块登记的 `roles.api.ts` 读取角色选项。

后端运行时校验共享 Schema 并写入用户及用户角色关系。用户名和邮箱分别只在未删除用户中唯一，数据库使用 `is_deleted = false` 部分唯一索引保证并发安全；软删除后允许新用户复用用户名或邮箱，历史值保持不变。用户角色组合只在未删除关系中唯一，并沿用软删除和恢复语义。用户名/邮箱冲突返回业务错误；当前用户不可删除自身；所有读取过滤软删除记录。

## 测试策略

后端自动化测试覆盖分页、角色 ID、软删除、有效记录唯一索引和模块公共文件类型检查；前端
表单转换与业务错误展示由维护者人工验收。

## 相关 ADR、计划和 AI 日志

- [ADR-0015：统一软删除业务唯一性约束](../../decisions/ADR-0015-active-row-business-uniqueness.md)
