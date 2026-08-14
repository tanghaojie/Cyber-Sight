---
title: JWT Bearer 与 LRU 认证改造
status: completed
created: 2026-07-28
updated: 2026-07-28
---

# JWT Bearer 与 LRU 认证改造

## 目标

把数据库 cookie 会话改为 Bearer JWT，并以最多 100 个 token 的进程内 LRU 活跃允许列表完成零数据库鉴权。

## 背景与设计依据

现有 `auth_sessions` 令牌校验在每个受保护请求上查询数据库。实现依据认证模块设计、模块边界、测试策略和 ADR-0019。

## 范围

- 登录契约、JWT 签发/验证、Bearer 解析和 LRU token 缓存。
- 前端 token 持久化、请求头注入、401/退出清理。
- 用户与角色变更触发的缓存失效。
- 删除 `auth_sessions` Schema 并生成迁移。
- 相关测试、配置和文档。

## 非目标

- 不实现 refresh token、跨设备会话管理或服务端 token 列表 UI。
- 不支持多实例共享缓存或重启后保留会话。
- 不改变用户名密码校验方式。

## 前置条件和风险

- 发布时必须提供至少 32 个字符的 `JWT_SECRET`。
- 数据库迁移和进程重启都会使旧 cookie 会话失效。
- LRU 淘汰意味着第 101 个活跃 token 会使最久未使用 token 失效。

## 实施任务

- [x] 更新认证设计并记录 ADR、计划和 AI 协作日志。
- [x] 先增加 JWT、LRU、Bearer Client 和认证 store 失败测试。
- [x] 实现后端 JWT LRU token 缓存与 Bearer 鉴权。
- [x] 更新登录契约和前端 token 生命周期。
- [x] 删除数据库会话 Schema 并生成迁移。
- [x] 运行测试、构建、迁移检查和差异检查。
- [x] 回填结果，归档计划与日志并创建 AI 标记提交。

## 测试与验证

- `pnpm test`：通过；API 契约 TypeScript 检查、后端 58 项测试、前端 42 项测试全部通过。
- `pnpm build`：通过；API 契约、后端 TypeScript、前端 `vue-tsc` 与 Vite 生产构建全部通过。
- 定向认证测试：JWT 篡改/过期/撤销、默认 100 容量、LRU 命中刷新、Bearer 路由、logout 失效、前端请求头和 token 清理全部通过。
- 迁移：Drizzle 生成 `0006_lively_doctor_strange.sql`，迁移测试确认删除 `auth_sessions`。
- `git diff --check`：通过。

## 发布与回滚

前后端、环境配置和数据库迁移同步发布。回滚需恢复旧前后端和 `auth_sessions` 表结构；旧会话数据不会恢复，用户需重新登录。

## 实际偏差和遗留问题

- 采用 `jose` 6.2.4 执行 HS256 JWT 签发和完整验证，并固定 issuer/audience，避免维护自制加密实现。
- Fastify 应用测试默认生成进程级随机 secret；实际服务启动仍强制读取至少 32 个字符的 `JWT_SECRET`。
- OpenAPI 全局声明 Bearer JWT，登录和健康检查显式标为公开。
- 现有 Vite CJS、Sass legacy API 和第三方 PURE 注释警告仍存在，不影响测试或构建，也不由本任务引入。
- 本计划与实现由同一最终提交归档。

## 相关设计、ADR 和 AI 日志

- `docs/design/modules/auth.md`
- `docs/decisions/ADR-0019-jwt-lru-token-cache.md`
- `docs/archive/ai-logs/2026/07/2026-07-28-jwt-lru-authentication.md`
