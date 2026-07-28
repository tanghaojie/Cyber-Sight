---
title: 角色模块
status: active
owner: maintainers
updated: 2026-07-27
---

# 角色模块

## 职责与边界

`roles` 拥有角色列表、创建、编辑、软删除、菜单授权输入和独立角色管理页面。它通过菜单模块公开的菜单列表选择授权目标，不读取菜单页面内部状态。

## 公共接口

- HTTP：`GET/POST /admin/roles`、`PUT/DELETE /admin/roles/{id}`。
- 前端公共文件：`view-registry.ts` 登记角色管理页面；`roles.api.ts` 暴露角色管理 API 以及用户模块所需的 `listRoleOptions` 与 `RoleOption`。
- 契约：`RoleSummary`、`RoleRequest` 及分页响应。

## 依赖、数据流与失败模式

`RolesPage.vue` 聚合 `pages/components/RolesList.vue` 与 `RoleDialog.vue`。列表组件拥有分页、搜索、
错误和删除交互；Dialog 通过菜单模块登记的 `menu-options.ts` 获取授权树，并拥有创建/编辑表单、
校验和保存。Page 只选择编辑对象并在保存后刷新列表。

角色编码只在未删除角色中唯一，数据库使用 `is_deleted = false` 部分唯一索引保证并发安全；软删除后允许新角色复用编码。角色菜单组合只在未删除关系中唯一，在更新时以软删除和恢复方式替换。系统内置角色的保护规则由后端执行，前端只展示返回错误。

## 测试策略

覆盖分页、菜单授权转换、业务错误展示、软删除、有效记录唯一索引和模块公共文件。

## 相关 ADR、计划和 AI 日志

- [ADR-0015：统一软删除业务唯一性约束](../../decisions/ADR-0015-active-row-business-uniqueness.md)
