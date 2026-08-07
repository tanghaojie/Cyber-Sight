---
title: NestJS 与 Fastify adapter 后端迁移
date: 2026-08-07
status: completed
---

# NestJS 与 Fastify adapter 后端迁移

## 用户目标和约束

用户要求评估并一次性完成从 Fastify 到 NestJS 的后端迁移，同时继续使用 Fastify adapter。共享 `api-contract` 必须继续约束 Nest 接口，不把 Fastify Zod Type Provider 作为 Controller 主方案，并保持现有业务行为。完成后按项目要求创建 Git 提交。

## 关键问答与确认

- 历史上使用 Fastify 4 是为了控制当时 Zod 契约统一任务的升级范围，并非 Fastify 5 存在项目级阻塞。
- Nest 主链路采用 Zod Pipe、响应 Interceptor 和 Swagger 契约装饰器；Fastify Type Provider 会形成并行生命周期，因此不接入 Controller 主方案。
- Fastify adapter 继续负责 HTTP 引擎、`inject` 测试和审计日志 lifecycle hooks。
- 用户已将原工作区改名为 `Cyber-AI-Forge`；实施和提交均在改名后的真实仓库执行。

## AI 的重要假设

- 现有 HTTP 路径、业务状态码、401/404/500 映射、JWT、权限 Provider 和数据库模型都属于兼容基线。
- 业务服务和仓储应从 Fastify 实例解耦，但 Fastify request/reply 类型可留在 adapter 专属 Guard、Filter、认证头读取和审计 hooks 中。
- 测试默认不连接数据库；生产入口显式启用数据库关闭生命周期。

## 方案和执行摘要

1. 引入 NestJS、Fastify adapter、Nest Swagger、反射元数据和 RxJS，升级到 Fastify 5。
2. 建立 `AppModule`、全局 Runtime Module、授权 Guard、异常 Filter、契约 Interceptor 和 Zod Pipe。
3. 将所有系统路由迁移到 Nest Module/Controller，删除旧 Fastify route、plugin 和 barrel 入口。
4. 将服务和仓储依赖改为 `BackendRuntime`；审计采集继续使用 Fastify adapter hooks。
5. 将 `api-contract` 转换助手改为适配器无关命名，并为 HTTP 查询和路径数字增加 coercion。
6. 迁移集成测试，更新 Swagger、授权、审计、严格输入和错误映射回归断言。
7. 更新 README、现行设计、维护指南、关于页技术栈文案和 ADR-0032。

## 验证结果

- 暂存区门禁通过；`pnpm docs:archive:check` 返回 `NOT_DUE`。
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm build` 和 `pnpm test` 全部通过。
- 后端通过 14 个测试文件、116 项测试；共享契约和前端生产构建通过。
- `pnpm test:db` 连接 PostgreSQL 18.4 成功，并确认 `sys_users` 与 `drizzle.__drizzle_migrations` 存在。
- `git diff --check` 通过，当前源码和现行文档不再引用旧 Fastify 业务插件或 `toFastifySchema()`。

## 未决问题与下一步

- 前端关于页的 NestJS/Fastify 5 技术栈文案需要维护者在浏览器中人工确认；本次未创建或运行前端自动化测试。
- 本次不操作远端仓库、部署环境或数据库迁移。

## 相关设计、ADR、计划和提交

- 计划：[NestJS 与 Fastify adapter 后端迁移](../../../plans/2026-08-07-nestjs-fastify-migration.md)
- 设计：[后端模块设计](../../../../design/modules/backend.md)、[API 契约模块设计](../../../../design/modules/api-contract.md)
- ADR：[NestJS 与 Fastify adapter 后端基线](../../../../decisions/ADR-0032-nestjs-fastify-adapter.md)
- 提交：`refactor(backend)!: migrate to NestJS`。
