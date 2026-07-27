---
title: 认证模块
status: active
owner: maintainers
updated: 2026-07-27
---

# 认证模块

## 职责与边界

`auth` 拥有登录、退出、当前用户、数据库会话、凭据校验和前端认证 store。它公开当前用户解析与密码散列服务供需要鉴权或创建用户的模块使用，不公开会话仓储内部状态。

## 公共接口

- HTTP：`POST /auth/login`、`POST /auth/logout`、`GET /auth/me`。
- 后端入口：`authRoutes`、`requireCurrentUser`、`currentUserFromRequest`、`hashPassword`。
- 前端入口：`useAuthStore` 与登录页面懒加载器。

## 失败模式与测试

无效会话返回 HTTP 401；前端全局处理器清用户、导航与动态路由。测试覆盖密码、登录状态保存、显式清会话和路由保护。
