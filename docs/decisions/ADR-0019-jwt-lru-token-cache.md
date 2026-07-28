---
title: 使用 JWT 与进程内 LRU 活跃令牌缓存
status: accepted
date: 2026-07-28
---

# ADR-0019：使用 JWT 与进程内 LRU 活跃令牌缓存

## 背景

原认证使用 HttpOnly cookie 中的 opaque token，并在每次鉴权时联查 `auth_sessions`、`users` 和角色数据。所有受保护请求都会产生数据库读取。目标部署常用前端 Bearer JWT，同时需要显式登出和受控的最大活跃 token 数。

## 决策驱动因素

- 受保护请求不再为会话校验访问数据库。
- 前端统一使用 Bearer token。
- 保留显式撤销能力，并把单进程内存占用限制为最多 100 个 token。
- 拒绝伪造、过期、已淘汰和进程重启前签发的 token。

## 考虑的方案

- 纯无状态 JWT：数据库压力最低，但显式登出和即时撤销需要额外 denylist。
- 数据库会话加 LRU 读缓存：缓存未命中仍访问数据库，保留持久会话与多实例能力。
- JWT 加进程内 LRU 活跃允许列表：鉴权零数据库读取，容量和撤销语义明确，但会话不跨进程或重启。

## 决策

使用 HS256 JWT，并要求至少 32 个字符的 `JWT_SECRET`。JWT 固定 issuer `jtlab`、audience `jtlab-api`，有效期为 8 小时；后端同时把 token 标识对应的当前用户快照保存在每个 Fastify 实例独立的 LRU 活跃允许列表中，容量固定为 100。

每次鉴权必须同时满足 Bearer 格式正确、JWT 签名/算法/过期校验通过、token 存在于允许列表。命中刷新 LRU 顺序；第 101 个 token 淘汰最久未使用 token。登出撤销当前 token，用户身份变更撤销该用户 token，角色定义变更清空允许列表。删除 `auth_sessions` 表和 cookie 会话路径。

前端在 `localStorage` 保存 access token，并由共享 Client 统一注入 Bearer 头；HTTP 401 和显式退出都清除本地 token。

## 正面结果

- 常规鉴权只访问内存并执行本地签名校验，不访问数据库。
- 活跃 token 上限、淘汰顺序和撤销行为可单元测试。
- JWT 过期与 LRU 允许列表形成双重有效性边界。

## 负面结果与风险

- 进程重启会让全部 token 失效。
- 多实例之间不共享允许列表；在引入粘性会话或共享存储前不得直接水平扩展。
- `localStorage` 中的 token 可被同源 XSS 读取，因此必须维持严格的前端依赖和内容注入安全边界。
- 用户角色快照不会自行刷新，必须通过管理写路径主动撤销相关 token。

## 验证和复审条件

- 测试覆盖 JWT 篡改/过期、LRU 淘汰和命中刷新、Bearer 解析与注入、登出和权限变更撤销。
- 若需要多实例、无感重启、超过 100 个并发登录 token、刷新 token 或集中式撤销，重新评估 Redis 等共享会话存储及 token 生命周期。

## 相关设计和计划

- `docs/design/modules/auth.md`
- `docs/archive/plans/2026-07-28-jwt-lru-authentication.md`
