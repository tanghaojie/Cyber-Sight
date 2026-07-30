---
title: 角色模块
status: active
owner: maintainers
updated: 2026-07-30
---

# 角色模块

## 职责与边界

`roles` 拥有角色定义、列表、创建、编辑、软删除和独立角色管理页面。角色功能权限和角色数据策略由 authorization 模块拥有；角色不再保存或编辑菜单 ID。

## 公共接口

- HTTP：`GET/POST /admin/roles`、`PUT/DELETE /admin/roles/{id}`。
- 前端公共文件：`registerViews.ts` 登记角色管理页面；`roles.api.ts` 暴露角色管理 API 以及用户模块所需的 `listRoleOptions` 与 `RoleOption`。
- 后端公共文件：`roles.access.ts` 暴露角色存在性和候选角色中的有效角色 ID。
- 契约：`RoleSummary`、`RoleRequest` 及分页响应。

## 依赖、数据流与失败模式

`RolesPage.vue` 聚合 `pages/components/RolesList.vue` 与 `RoleDialog.vue`。列表组件拥有分页、搜索、错误和删除交互；Dialog 保存角色定义后，通过 authorization 公共 API 保存功能权限键和数据策略。新建时若第二步失败，会明确提示角色已保存但授权配置未完成，维护者可重新编辑补齐。

角色编码只在未删除角色中唯一，数据库使用 `is_deleted = false` 部分唯一索引保证并发安全；软删除后允许新角色复用编码。所有角色管理写路由要求 `roles.manage`；角色选项读取同时允许 `users.manage`。`sys_role_menus` 仅保留兼容关系，不再由角色仓储读写。

## 测试策略

后端自动化测试覆盖路由门禁、软删除、有效记录唯一索引和模块公共文件；前端功能权限、角色数据策略与业务错误展示由维护者人工验收。

初始版本之前的软删除唯一性取舍保留在[归档 ADR](../../archive/README.md)，当前语义以本设计、数据库 Schema 和后端测试为准。
