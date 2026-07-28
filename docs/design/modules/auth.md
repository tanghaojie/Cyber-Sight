---
title: 认证模块
status: active
owner: maintainers
updated: 2026-07-28
---

# 认证模块

## 职责与边界

`auth` 拥有登录、退出、当前用户、JWT 签发与校验、进程内活跃令牌缓存、凭据校验和前端认证 store。它公开当前用户解析、会话失效与密码散列服务供需要鉴权、使用户权限变更生效或创建用户的模块使用，不公开令牌缓存内部状态。

## 数据流与会话生命周期

1. 登录在数据库中校验用户凭据并读取角色，签发 issuer 为 `jtlab`、audience 为 `jtlab-api`、8 小时有效的 HS256 JWT，然后把 token 标识与当前用户快照写入容量为 100 的进程内 LRU 缓存。
2. 登录响应返回 `{ status: 0, data: { user, token } }`；前端把 token 保存到 `localStorage`，共享 API Client 为请求附加 `Authorization: Bearer <token>`。
3. 鉴权先严格解析 Bearer 头，再校验 JWT 签名、算法和过期时间，最后从 LRU 活跃令牌缓存读取用户快照；命中会刷新最近使用顺序，不执行会话或用户数据库查询。
4. 缓存写入第 101 个活跃 token 时淘汰最久未使用项；缓存未命中、过期、显式退出和进程重启都使 token 失效。
5. 用户更新或删除后撤销该用户全部 token；角色更新或删除后清空全部 token，避免缓存继续携带旧身份或角色。菜单等业务数据仍由各自模块按请求读取。

`JWT_SECRET` 是后端必填部署配置，至少 32 个字符，不进入版本控制。缓存是单进程状态，因此当前方案面向单实例部署；扩展到多实例前必须改用共享会话存储或重新评估允许列表语义。

## 公共接口

- HTTP：`POST /auth/login`、`POST /auth/logout`、`GET /auth/me`。除登录外的认证请求使用 Bearer token。
- 后端公共文件：`auth.routes.ts` 暴露 `authRoutes`；`auth.service.ts` 暴露 `requireCurrentUser`、`currentUserFromRequest`、`revokeUserTokens`、`revokeAllTokens`；`auth.security.ts` 暴露 `hashPassword`。
- 前端公共文件：`auth.store.ts` 暴露 `useAuthStore`；`auth.routes.ts` 暴露登录页面懒加载器 `loginPage`。

## 失败模式与测试

缺少 Bearer 头、格式错误、签名错误、过期、缓存未命中或已撤销均返回 HTTP 401；前端全局处理器同时清除用户、token、导航与动态路由。测试覆盖密码、JWT 完整性与过期、LRU 容量和最近使用顺序、Bearer 注入、登录状态持久化、显式清会话和路由保护。

`auth_sessions` 表不再属于当前数据模型，由迁移删除。发布该变更会使全部旧 cookie 会话失效，用户需要重新登录。

## 相关 ADR

- [ADR-0019：使用 JWT 与进程内 LRU 活跃令牌缓存](../../decisions/ADR-0019-jwt-lru-token-cache.md)
