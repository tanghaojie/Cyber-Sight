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
- 前端公共文件：`auth.store.ts` 暴露 `useAuthStore`；`auth.routes.ts` 暴露登录页面懒加载器 `loginPage`。

## 失败模式与测试

无效会话返回 HTTP 401；前端全局处理器清用户、导航与动态路由。测试覆盖密码、登录状态保存、显式清会话和路由保护。

会话令牌哈希 `token_hash` 不是可复用业务自然键。即使会话已经软删除，也继续保持全表唯一，避免意外重新使用历史令牌身份；它不适用业务表“只在未删除记录中唯一”的规则。

## 相关 ADR

- [ADR-0015：统一软删除业务唯一性约束](../../decisions/ADR-0015-active-row-business-uniqueness.md)
