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
- 前端入口：用户管理页面懒加载器。
- 契约：`UserSummary`、`UserCreate`、`UserUpdate` 及分页响应。

## 依赖、数据流与失败模式

页面经本模块 API service 调用后端；后端运行时校验共享 Schema 并写入用户及用户角色关系。用户名/邮箱冲突返回业务错误；当前用户不可删除自身；所有读取过滤软删除记录。

## 测试策略

覆盖分页、表单转换、角色 ID、业务错误展示、软删除和模块公共入口类型检查。
