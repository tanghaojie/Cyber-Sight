---
title: BackendRuntime 到 Nest Injectable Provider 重构
date: 2026-08-08
status: completed
---

# BackendRuntime 到 Nest Injectable Provider 重构

## 用户目标和约束

用户确认按方案 B 实施：移除 `BackendRuntime`，并将全部 repository、access 和 application service 改为 `@Injectable()` class。必须保持现有认证、JWT 会话、授权、HTTP 契约和数据库行为。

## 关键假设

- 采用 `@nestjs/jwt` 作为 JWT 工具层，但保留项目自己的 AuthService、数据库 token 会话和 LRU 语义。
- 数据库使用 Nest 自定义 Provider token 注入；不把 PostgreSQL/Drizzle 客户端封装成业务模块的公共状态。
- 第一阶段完整 class 化后端业务服务，但不改变业务 API 和数据模型。

## 执行摘要

已完成暂存区门禁检查、相关现行设计阅读和 `pnpm docs:archive:check`。归档审计返回 `DUE`（architecture change），已建立实施计划和归档审查计划。

## 实际改动

- 删除 `BackendRuntime`，以 `DATABASE`、`JWT_SECRET` 和动态 `AuthorizationModule.register()` 作为组合根边界。
- 引入 `@nestjs/jwt`/`JwtModule`，将 `JwtTokenCache`、`AuthService`、`AuthorizationService`、全部 repository/access/application service 改为显式 `@Injectable()` providers。
- 迁移 Controllers、Guard、API log hooks 与测试注入；删除生产代码和测试中的旧 runtime 访问。
- 移除不再使用的 `jose` 依赖；保留原 JWT claims、HS256、issuer/audience、持久会话和 7 天默认 TTL。

## 验证结果

- `pnpm format`、`pnpm format:check`、`pnpm build` 通过。
- `pnpm test` 通过：14 个测试文件、126 个测试。
- 待最终提交后更新归档 ledger 的 repository 基线，并再次执行 `pnpm docs:archive:check:ci`。
