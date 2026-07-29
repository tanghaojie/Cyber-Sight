---
title: 以 Zod 作为统一 Schema 编写源
status: accepted
date: 2026-07-23
---

# ADR-0007：以 Zod 作为统一 Schema 编写源

## 背景

ADR-0006 建立了共享运行时 Schema 契约，但实现同时使用 TypeBox 定义 HTTP 契约、Zod 校验环境变量。两者没有重复描述同一结构，却要求维护者理解两套 Schema API、依赖和边界行为，不符合脚手架降低认知成本的目标。

当前项目使用 Fastify 4、Swagger 8 和 Zod 3。最新 `@fastify/type-provider-zod` 面向 Fastify 5、Swagger 9.5+ 和 Zod 4.2+；为了统一 Schema 而同时升级整个 Fastify 栈，会扩大变更风险。Zod 4 已原生支持将 Schema 转换为 Draft 7 和 OpenAPI 3.0 JSON Schema，因此可以在不升级 Fastify 的前提下作为唯一编写源。

## 决策驱动因素

- 项目只保留一套面向维护者的 Schema API。
- HTTP 请求仍必须由 Fastify 在运行时校验，响应仍使用其 JSON Schema 序列化。
- Swagger 必须继续从真实路由生成。
- 本次不夹带 Fastify 5、Swagger 9 或路由类型提供器升级。
- Schema 到 JSON Schema 的转换必须可测试，不能重新形成手写双源。

## 考虑的方案

1. 保留 TypeBox，改用 TypeBox 校验环境变量。与 Fastify 最直接，但项目其他外部数据校验和复杂规则更适合 Zod，且现有维护者已使用 Zod。
2. 升级 Fastify 5 并接入最新官方 Zod Type Provider。集成完整，但同时改变框架、Swagger、校验和序列化栈，超出本次目标。
3. 升级到 Zod 4，以 Zod Schema 推导类型并生成 Draft 7 JSON Schema交给现有 Fastify 4。只替换 Schema 编写源，保留稳定运行时。

## 决策

- `@scaffold/api-contract` 使用 Zod 4 `z.strictObject()` 等 API 定义请求、响应和公共结构。
- TypeScript 类型统一通过 `z.infer<typeof Schema>` 推导。
- 契约包提供唯一的 `toFastifySchema()` 转换函数，内部调用 `z.toJSONSchema(schema, { target: 'draft-7' })`，移除根级 `$schema` 后交给 Fastify。
- Fastify 4 继续使用 AJV 校验请求、`fast-json-stringify` 序列化响应，并通过现有 Swagger 插件生成 OpenAPI。
- 环境变量继续直接使用 Zod `safeParse`；TypeBox 依赖完全移除。
- HTTP 契约只允许能够稳定转换为 JSON Schema 的 Zod 子集。`transform`、`Date`、`Map`、`Set` 和无法表示的自定义规则不得作为传输契约；跨字段业务规则放在应用层，或在路由校验后显式执行。
- 本决策仅取代 ADR-0006 中选择 TypeBox 的实现细节；共享运行时 Schema、TypeScript 推导类型和按需生成 OpenAPI 的总体决策继续有效。

## 正面结果

- 环境变量、HTTP 契约和未来外部数据校验统一使用 Zod API。
- 请求与响应结构仍只编写一次，JSON Schema 是内存中的派生产物。
- 不需要引入当前栈不兼容的 Zod Type Provider，也不需要升级 Fastify。
- 前端继续只导入推导类型，不把 Zod 运行时代码打入业务包。

## 负面结果与风险

- Fastify HTTP 请求最终由 Zod 生成的 JSON Schema和 AJV 校验，而不是调用 `safeParse`；转换结果必须纳入测试。
- Zod 某些强大能力不能表达为 JSON Schema，契约作者必须遵守可转换子集。
- Zod 4 是一次依赖升级，环境变量错误格式和字符串格式生成结果需要回归。
- 将来升级 Fastify 5 时，是否改用官方 Zod Type Provider 需要单独复审，不能默认替换。

## 验证和复审条件

- 契约包不再依赖 TypeBox，仓库只有 Zod 一套 Schema 编写库。
- `pnpm test` 覆盖额外字段、范围、格式、Swagger 结构和环境变量校验。
- `pnpm build` 证明前后端推导类型和生产产物有效。
- Fastify 5 升级正式立项时复审直接 Zod Provider 与当前转换方案。

## 相关设计和计划

- [API 契约模块设计](../../design/modules/api-contract.md)
- [后端模块设计](../../design/modules/backend.md)
- [实施计划](../plans/2026-07-23-zod-schema-unification.md)
- [Zod JSON Schema 文档](https://zod.dev/json-schema)
- [Fastify Validation and Serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)
