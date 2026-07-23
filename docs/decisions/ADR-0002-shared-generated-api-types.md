---
title: 共享 OpenAPI 生成类型并以契约测试校验运行时接口
status: superseded
date: 2026-07-22
---

# ADR-0002：共享 OpenAPI 生成类型并以契约测试校验运行时接口

> 已由 [ADR-0006](ADR-0006-runtime-schema-as-api-contract.md) 取代。该 ADR 定义的复审条件已经出现：OpenAPI、Fastify JSON Schema 和部分 Zod Schema 的重复维护成本超过了当前跨语言收益。

## 背景

前端类型原本生成在 `apps/frontend` 内，后端则独立维护 Zod 和 Fastify JSON Schema。这样后端无法在编译期消费相同接口类型，接口变化也没有自动漂移检测。

## 决策

- 将 `openapi-typescript` 生成物放在 `packages/openapi-spec/src/schema.d.ts`。
- `@scaffold/openapi-spec` 作为 workspace 类型包，由前端和后端共同依赖。
- Fastify 路由使用生成的 request/response 类型约束处理函数。
- 保留 Fastify 运行时 JSON Schema，并增加契约测试比较关键路径、operationId 和响应 Schema。
- 暂不在运行时解析 YAML，也不引入复杂的 OpenAPI 到 Fastify Schema 生成器。

## 结果

- 前后端编译期接口类型只有一个生成来源。
- OpenAPI 仍保持跨语言能力，不绑定 TypeScript 源码。
- Fastify 继续具备高效运行时校验和 Swagger 文档。
- 仍存在 OpenAPI 与运行时 Schema 两种表达，但测试会在不一致时失败。

## 复审条件

当接口数量增加导致运行时 Schema 重复维护成本显著上升，或契约测试无法覆盖复杂组合类型时，重新评估从 OpenAPI 自动生成服务端 Schema。
