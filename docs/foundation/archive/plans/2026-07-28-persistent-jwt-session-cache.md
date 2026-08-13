---
title: JWT 数据库会话与 LRU 读缓存修正
status: completed
created: 2026-07-28
updated: 2026-07-28
---

# JWT 数据库会话与 LRU 读缓存修正

## 目标

恢复数据库 token 会话持久化，把容量 100 的 LRU 修正为读缓存，使淘汰或进程重启只触发数据库回源，不限制有效登录数量。

## 背景与设计依据

前一实现错误地把 LRU 当成活跃允许列表。实现依据认证模块设计、模块边界、测试策略和 ADR-0020。

## 范围

- 恢复 `auth_sessions` Schema 和迁移。
- 登录持久化 token 哈希，缓存未命中回源数据库。
- 退出、用户删除的持久撤销，以及用户/角色变更的缓存失效。
- 修正 LRU 测试、路由测试、设计、ADR 和协作记录。

## 非目标

- 不保存明文 JWT。
- 不实现 refresh token、会话管理 UI 或过期记录清理任务。
- 不引入 Redis 或跨实例缓存失效广播。

## 前置条件和风险

- 已提交迁移 `0006` 会删除表，因此必须新增后续迁移重新建表，不能改写历史迁移。
- 迁移后已有内存 token 没有数据库记录，会在部署时失效；此后新 token 均持久化。
- 多实例主动撤销仍可能短暂受其他实例本地缓存影响。

## 实施任务

- [x] 修正设计并创建 ADR、计划和 AI 协作记录。
- [x] 先把 LRU 测试改为淘汰后回源仍有效。
- [x] 恢复数据库会话 Schema、仓储读写与迁移。
- [x] 调整登录、鉴权、退出和权限变更缓存失效语义。
- [x] 运行全量测试、构建、迁移检查和差异检查。
- [x] 回填结果，归档计划、日志和被取代 ADR，并创建 AI 标记提交。

## 测试与验证

- `pnpm test`：通过；API 契约 TypeScript 检查、后端 63 项测试、前端 42 项测试全部通过。
- `pnpm build`：通过；API 契约、后端 TypeScript、前端 `vue-tsc` 与 Vite 生产构建全部通过。
- 定向认证测试：100 容量、LRU 顺序、淘汰后持久层回源、缓存命中不回源、JWT 篡改/过期、登录哈希持久化、logout 持久撤销全部通过。
- 迁移：Drizzle 生成 `0007_gorgeous_ma_gnuci.sql` 恢复 `auth_sessions`；再次执行生成检查显示无 Schema 漂移。
- `git diff --check`：通过。

## 发布与回滚

前后端契约不变，只需部署后端和运行新迁移。回滚需要同时回滚代码并保留/处理新增 `auth_sessions` 表。

## 实际偏差和遗留问题

- 前后端 HTTP 契约未变化，只修正后端会话存储和缓存语义。
- 尝试把 `auth_sessions` Schema 移入 auth 模块，但 Drizzle Kit 0.23 无法解析 NodeNext 源码中的跨文件 `.js` Schema 依赖；为保持迁移生成可执行，本轮继续在存量 `src/db/schema.ts` 登记，并在后端设计记录该工具链限制。
- 已提交的 `0006` 迁移不可改写，因此由 `0007` 顺序重建表。部署后，上一错误版本签发但未写库的 token 需要重新登录；新 token 均持久化。
- 多实例严格即时撤销仍需失效广播、共享缓存或缓存 TTL，当前本地缓存可能陈旧到淘汰或 token 过期。
- 现有 Vite CJS、Sass legacy API 和第三方 PURE 注释警告仍存在，不影响测试或构建，也不由本任务引入。
- 本计划与实现由同一最终提交归档。

## 相关设计、ADR 和 AI 日志

- `docs/design/modules/auth.md`
- `docs/decisions/ADR-0020-persistent-jwt-session-cache.md`
- `docs/archive/ai-logs/2026/07/2026-07-28-persistent-jwt-session-cache.md`
