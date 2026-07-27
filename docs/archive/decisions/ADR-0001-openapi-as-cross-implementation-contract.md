---
title: 以 OpenAPI 作为跨实现 API 契约
status: superseded
date: 2026-07-22
---

# ADR-0001：以 OpenAPI 作为跨实现 API 契约

> 已由 [ADR-0006](../../decisions/ADR-0006-runtime-schema-as-api-contract.md) 取代。项目不再为尚未确定的跨语言实现持续维护 OpenAPI-first 链路。

## 背景

项目既要支持 AI 快速生成业务，也要保留未来将 Fastify 后端替换为 Java 的能力。直接共享 TypeScript 类型会把前端和后端绑定到同一种语言，手工同步接口则容易漂移。

## 决策

使用 `packages/openapi-spec/openapi.yaml` 作为跨前端、Fastify 和未来 Java 实现的 API 契约。API 变化先修改契约，再生成客户端类型、实现服务端并执行契约校验。

Fastify 是默认且唯一的当前后端实现。Java 仅作为需求驱动的替换方案，不提前维护双实现。

## 结果

- 前端不依赖具体后端框架。
- AI 有明确的 API 修改入口和顺序。
- 引入 Java 时可以复用协议定义和回归用例。
- 项目必须补充服务端契约校验，解决当前 OpenAPI、Fastify Schema 和 Zod Schema 重复的问题。

## 未决事项

服务端 Schema 是从 OpenAPI 生成，还是保留代码定义并在 CI 中进行一致性检查，需要单独 ADR 决定。
