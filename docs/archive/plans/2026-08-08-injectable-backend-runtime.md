---
title: BackendRuntime 到 Nest Injectable Provider 重构
status: completed
created: 2026-08-08
updated: 2026-08-08
---

# BackendRuntime 到 Nest Injectable Provider 重构

## 目标

按方案 B 移除粗粒度 `BackendRuntime` 依赖容器，将 JWT、认证、授权、数据库访问以及全部 repository、access 和 application service 纳入 Nest 标准 Provider 生命周期，同时保持现有 HTTP、数据库、会话和权限语义。

## 背景与设计依据

当前 `BackendRuntime` 将数据库、JWT token cache 和授权 Provider 聚合后传递给 Controller、Guard 及普通函数。该方式便于早期 Nest 迁移，但隐藏了真实依赖并使模块可访问不需要的运行时能力。改造依据为[后端模块设计](../../design/modules/backend.md)、[认证模块](../../design/modules/auth.md)、[授权与数据范围模块](../../design/modules/authorization.md)、[模块边界](../../design/module-boundaries.md)以及 ADR-0032。

## 范围

- 引入 `@nestjs/jwt`，由 `JwtModule` 配置 JWT 签发与校验。
- 将 `JwtTokenCache`、认证服务、授权服务、全部 repository/access/application service 改为 `@Injectable()` class。
- 以明确的数据库 Provider、认证服务和授权 Provider 替代 `BackendRuntime` 聚合对象。
- 保持 token claims、issuer、audience、算法、持久会话、LRU 缓存和撤销语义不变。
- 更新 Nest 模块注册、测试注入、现行设计、ADR、归档审查记录和验证结果。

## 非目标

- 不修改 HTTP 路径、共享 Zod 契约、错误码、数据库 Schema 或迁移。
- 不改变权限模型、数据范围规则、审计保留策略或前端认证行为。
- 不引入 Passport；认证仍由项目自己的 Guard 和 AuthService 完成。

## 前置条件和风险

- `@nestjs/jwt` 底层使用 `jsonwebtoken`，需要显式保留现有 issuer、audience、algorithm、subject、jti 和过期校验。
- 测试中的可控时钟要通过 token cache options/provider 保留，不能依赖真实系统时间。
- 现行设计记载 JWT 有效期为 8 小时，但当前实现默认 7 天；本次迁移前必须以维护者确认的当前实现边界为准并记录偏差。
- 依赖注入模块不能形成 `auth`、`authorization` 与管理模块之间的循环。

## 实施任务

- [x] 建立实施计划、归档审查计划和 AI 协作记录。
- [x] 更新数据库、JWT、认证和授权 Provider 边界。
- [x] 将所有 repository、access 和 application service 改为 Injectable class。
- [x] 迁移 Controller、Guard、Fastify 审计 hooks 和组合根，删除 `BackendRuntime`。
- [x] 迁移单元与集成测试的 Provider 覆盖方式。
- [x] 更新设计、ADR、索引和归档审查记录。
- [x] 执行格式、类型、构建、后端测试、契约测试、文档审计和 diff 检查。
- [x] 归档完成计划与 AI 协作记录，并创建带模型 trailer 的 Git 提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm build`
- `pnpm test`
- `pnpm docs:archive:check:ci`
- `git diff --check`

## 发布与回滚

本次不修改数据库和 HTTP 契约，发布只需部署后端代码和 lockfile。若需回滚，恢复本次代码与依赖提交即可；数据库无需回滚。

## 实际偏差和遗留问题

 - JWT 原有实现默认有效期为 7 天，本次迁移保持该行为；当前认证设计已同步为 7 天。
 - `ApiLogWriter` 是 Fastify hook 的适配器队列，继续由 `createApiLogWriter()` 以 adapter logger 显式组装；repository、access 和业务 application service 均已纳入 Nest provider 生命周期。
 - `jose` 仅用于旧测试解码且已移除；JWT 签发和校验统一经 `@nestjs/jwt`/`JwtModule`。

## 实际验证结果

- `pnpm format`、`pnpm format:check` 通过。
- `pnpm build` 通过（API contract、backend、frontend）。
- `pnpm test` 通过：14 个后端测试文件、126 个测试。
- `pnpm docs:archive:check:ci` 与 `git diff --check` 在提交前执行。

## 相关设计、ADR 和 AI 日志

- [后端模块设计](../../design/modules/backend.md)
- [认证模块](../../design/modules/auth.md)
- [授权与数据范围模块](../../design/modules/authorization.md)
- [模块边界](../../design/module-boundaries.md)
- [ADR-0036：Nest Provider 作为后端依赖边界](../../decisions/ADR-0036-nest-provider-dependency-boundary.md)
- [AI 协作记录](../../ai-logs/2026/08/2026-08-08-injectable-backend-runtime.md)
