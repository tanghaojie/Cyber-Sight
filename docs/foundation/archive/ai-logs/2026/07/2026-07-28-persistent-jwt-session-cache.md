---
title: JWT 数据库会话与 LRU 读缓存修正
date: 2026-07-28
status: completed
---

# JWT 数据库会话与 LRU 读缓存修正

## 用户目标和约束

用户指出 JWT 必须全部持久化到数据库 token 表，LRU 仅用于缓存数据库验证结果，不能把系统限制为最多 100 个有效登录 token。

## 关键问答与确认

明确修正为缓存命中不查库、缓存未命中回源数据库；LRU 淘汰和进程重启不撤销持久会话。

## AI 的重要假设

- 数据库存储 token 的 SHA-256 哈希而非明文，仍满足全部 token 会话持久化与按 token 查询。
- 继续使用现有 8 小时 JWT、Bearer 请求头和前端 token 生命周期。
- 已提交迁移不可改写，新增迁移恢复 `auth_sessions`。

## 方案和执行摘要

创建 ADR-0020 取代 ADR-0019；恢复 `auth_sessions` Schema 和后续迁移。登录写入 token SHA-256 哈希，JWT LRU 通过持久层 loader 实现 read-through cache；缓存淘汰只触发下次回源。退出和用户删除持久撤销数据库会话，用户资料与角色变更只失效缓存。

## 验证结果

- `pnpm test` 通过：后端 63 项、前端 42 项，API 契约 TypeScript 检查通过。
- `pnpm build` 通过：共享契约、后端 TypeScript、前端类型检查和生产构建通过。
- 测试证明 101 个 token 只占 100 个缓存槽，被淘汰 token 可由持久层 loader 回填；缓存命中不会重复调用 loader。
- 登录测试确认数据库只写 token 哈希，logout 测试确认执行持久撤销并清除缓存。
- Drizzle 迁移 `0007_gorgeous_ma_gnuci.sql` 重建 `auth_sessions`，重复生成检查无漂移；`git diff --check` 通过。

## 未决问题与下一步

当前无阻塞。多实例严格即时撤销、过期会话清理和 Drizzle 模块化 Schema 工具链升级留待后续设计。

## 相关设计、ADR、计划和提交

- `docs/design/modules/auth.md`
- `docs/decisions/ADR-0020-persistent-jwt-session-cache.md`
- `docs/archive/plans/2026-07-28-persistent-jwt-session-cache.md`
- 本记录与实现由同一最终提交归档。
