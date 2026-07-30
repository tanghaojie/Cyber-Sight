---
title: 认证模块
status: active
owner: maintainers
updated: 2026-07-30
---

# 认证模块

## 职责与边界

`auth` 拥有登录、退出、当前用户、JWT 签发与校验、数据库 token 会话、进程内 LRU 读缓存、凭据校验和前端认证 store。它公开当前用户解析、会话撤销、缓存失效与密码散列服务供需要鉴权、使用户权限变更生效或创建用户的模块使用，不公开会话仓储或缓存内部状态。

## 数据流与会话生命周期

1. 登录在数据库中校验用户凭据并读取角色，签发 issuer 为 `jtlab`、audience 为 `jtlab-api`、8 小时有效的 HS256 JWT，把 token 的 SHA-256 哈希、用户和过期时间写入 `sys_auth_sessions`，再把 token 标识与当前用户快照写入容量为 100 的进程内 LRU 缓存。数据库不保存可直接复用的明文 token。
2. 登录响应返回 `{ status: 0, data: { user, issued: { token, expiresAt } } }`。`auth.api.ts` 封装登录、当前用户和退出请求，`auth.store.ts` 负责会话状态，并通过 `shared/accessToken.ts` 把 token 写入键为 `jtlib_access_token`、到期时间来自 `expiresAt` 的浏览器 cookie。共享 API Client 为请求附加 `Authorization: Bearer <token>`；清会话时同时清理 cookie 和旧 `localStorage` 键。
3. 鉴权先严格解析 Bearer 头并校验 JWT 签名、issuer、audience、算法和过期时间，再按 token 标识读取 LRU；缓存命中会刷新最近使用顺序，不查询数据库。
4. 缓存未命中时，以 token 哈希查询未撤销且未过期的 `sys_auth_sessions`，联查启用用户和角色后回填 LRU。第 101 个 token 只淘汰最久未使用的缓存项，不撤销数据库会话；该 token 下次请求会回源后继续有效。进程重启同样只产生冷缓存。
5. 显式退出先在数据库软删除当前会话，再删除缓存项。用户资料或角色变更只失效相关缓存，使下一次请求回源获得新快照；删除用户时同时撤销该用户全部数据库会话并失效缓存。

`JWT_SECRET` 是后端必填部署配置，至少 32 个字符，不进入版本控制。数据库会话让 token 跨进程重启并可在多实例上回源验证；当前 LRU 仍是实例本地缓存，多实例中的主动撤销可能在其他实例缓存中持续到该项被淘汰或 token 过期，严格即时撤销需要后续增加跨实例失效通知或共享缓存。

## 公共接口

- HTTP：`POST /auth/login`、`POST /auth/logout`、`GET /auth/me`。除登录外的认证请求使用 Bearer token。
- 后端公共文件：`auth.routes.ts` 暴露 `authRoutes`；`auth.service.ts` 暴露 `requireCurrentUser`、`currentUserFromRequest`、`invalidateUserTokenCache`、`revokeUserTokens`、`invalidateAllTokenCache`；`auth.security.ts` 暴露 `hashPassword`。`sys_auth_sessions` 当前与其他系统表统一登记在 `src/db/schema.ts`，只有 auth 模块读写。
- 前端公共文件：`auth.api.ts` 封装认证 HTTP 调用；`auth.store.ts` 暴露 `useAuthStore`；`auth.routes.ts` 暴露登录页面懒加载器 `loginPage`。

## 失败模式与测试

缺少 Bearer 头、格式错误、签名错误、过期、数据库会话不存在或已撤销均返回 HTTP 401；单纯缓存未命中会回源数据库。前端全局处理器同时清除用户、token、导航与动态路由。后端自动化测试覆盖密码、JWT 完整性与过期、LRU 容量和最近使用顺序、淘汰后回源与显式清会话；Bearer 注入、登录状态持久化、清状态和路由保护由维护者人工验收。

`sys_auth_sessions.token_hash` 全表唯一并保留软删除与审计字段。过期或撤销记录仍是历史安全标识，不重新使用；后续可增加独立清理策略，但清理不能改变仍有效 token 的鉴权语义。

认证只提供当前身份和展示用角色编码，不把功能权限或数据策略写入 JWT。业务路由由 authorization 插件在认证后从 Provider 重新解析权限，因此角色权限和数据策略修改可在下一请求生效；认证缓存中的角色快照不是授权判断来源。

初始版本之前的会话方案取舍保留在[归档 ADR](../../archive/README.md)，当前语义以本设计和后端自动化测试为准。
