---
title: JWT Bearer 与 LRU 认证改造
date: 2026-07-28
status: completed
---

# JWT Bearer 与 LRU 认证改造

## 用户目标和约束

用户要求把 `auth_sessions` 每请求数据库校验改为 JWT Bearer 鉴权，并用最多缓存 100 个 token 的内存 LRU 降低数据库压力。

## 关键问答与确认

用户明确指定 JWT、Bearer 请求头、内存缓存、LRU 和容量 100；其余生命周期细节按现有 8 小时会话与显式退出语义实现。

## AI 的重要假设

- 当前部署为单后端进程，可接受重启后全部 token 失效。
- token 缓存是活跃允许列表，LRU 未命中直接 401，不回查数据库。
- 前端使用 `localStorage` 保持刷新后的登录态；HTTP 401 必须同时删除本地 token。
- 用户或角色变更需主动撤销缓存，避免沿用原数据库联查具有的即时失效语义。

## 方案和执行摘要

先更新认证设计与 ADR-0019，再以测试驱动实现 JWT LRU 缓存、Bearer 契约和前端 token 生命周期。后端用 `jose` 签发和验证带 issuer/audience 的 HS256 JWT，LRU 允许列表固定容量 100；前端 `localStorage` 保存 token，共享 Client 统一附加 Bearer 头。用户修改/删除撤销该用户 token，角色修改/删除清空全部 token。`auth_sessions` Schema 已删除并生成 Drizzle 迁移。

## 验证结果

- `pnpm test` 通过：后端 58 项、前端 42 项，API 契约 TypeScript 检查通过。
- `pnpm build` 通过：共享契约、后端 TypeScript、前端类型检查和生产构建通过。
- JWT/LRU 定向测试覆盖 100 容量、LRU 顺序、篡改、过期、撤销和按用户撤销；路由测试证明 `/auth/me` 可在不查询数据库时通过 Bearer token 鉴权，logout 后相同 token 返回 401。
- Drizzle 迁移 `0006_lively_doctor_strange.sql` 删除 `auth_sessions`，Schema 与迁移测试通过。
- `git diff --check` 通过。

## 未决问题与下一步

当前无阻塞。部署前必须在本地/运行环境设置至少 32 个字符的 `JWT_SECRET`；应用迁移后旧 cookie 会话失效。若未来水平扩展，需改用共享会话存储或重新设计允许列表。

## 相关设计、ADR、计划和提交

- `docs/design/modules/auth.md`
- `docs/decisions/ADR-0019-jwt-lru-token-cache.md`
- `docs/archive/plans/2026-07-28-jwt-lru-authentication.md`
- 本记录与实现由同一最终提交归档。
