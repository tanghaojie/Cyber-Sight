---
title: NestJS 与 Fastify adapter 后端基线
status: accepted
date: 2026-08-07
---

# ADR-0032：NestJS 与 Fastify adapter 后端基线

## 背景

原后端直接使用 Fastify 4 的插件、封装域和路由函数。共享 Zod 契约解决了数据结构双源问题，但随着认证、授权、审计和管理模块增长，应用组装、生命周期与横切能力需要更明确的模块和依赖注入边界。历史上保留 Fastify 4，是因为当时统一 Zod Schema 的任务明确限制了框架升级范围，并非 Fastify 5 存在项目级兼容障碍。

## 决策

- 后端一次性迁移到 NestJS 11，并继续使用 `@nestjs/platform-fastify` 与 Fastify 5。
- HTTP 端点使用 Nest Module 和 Controller；鉴权、异常映射与响应契约分别使用全局 Guard、Filter 与 Interceptor。
- `packages/api-contract` 的 Zod Schema 继续是唯一人工编写的 HTTP 数据契约。输入由 `ZodValidationPipe` 解析，输出由契约 Interceptor 校验，OpenAPI 由 `ContractRoute` 派生。
- 不在 Nest Controller 主链路接入 Fastify Zod Type Provider。它依赖 Fastify route schema/type-provider 生命周期，会与 Nest Pipe、Interceptor 和 Swagger 元数据形成两套边界。
- Fastify adapter 只承担高性能 HTTP 引擎、`inject` 测试和审计日志生命周期 hooks；业务服务与仓储依赖 `BackendRuntime`，不依赖 Fastify 实例。
- 保持现有路径、统一响应、HTTP 状态映射、JWT、权限 Provider、审计保留策略、Drizzle Schema 和数据库迁移不变。

## 结果

- 模块注册、依赖注入和横切能力进入统一的 Nest 生命周期。
- 前后端继续共享 Zod 类型与运行时约束，无需维护 DTO 或手写 OpenAPI 第二来源。
- Fastify 4 升级为 Fastify 5；该变化随框架迁移一起由构建、路由注入和 Swagger 回归测试约束。
- 新端点必须同时声明 Nest 授权元数据、Zod 输入 Pipe 和 `ContractRoute` 响应契约。

## 验证和复审条件

- monorepo 构建、格式检查和测试通过；核心集成测试覆盖所有 operationId、严格输入、JWT、权限、404/500 与审计 hooks。
- 如果未来移除 Fastify adapter、发布外部 OpenAPI，或 Nest 提供能统一 Pipe/Swagger/类型推导的官方 Zod 主链路，再复审本决策。

## 相关设计

- [后端模块设计](../design/modules/backend.md)
- [API 契约模块设计](../design/modules/api-contract.md)
