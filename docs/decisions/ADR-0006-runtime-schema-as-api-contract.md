---
title: 以共享运行时 Schema 作为内部 API 契约
status: accepted
date: 2026-07-23
---

# ADR-0006：以共享运行时 Schema 作为内部 API 契约

> ADR-0007 取代本决策中选择 TypeBox 的实现细节。共享运行时 Schema、类型推导和按需生成 OpenAPI 的总体决策继续有效，当前统一由 Zod 4 实现。

## 背景

项目当前只有 TypeScript/Vue 前端和 TypeScript/Fastify 后端。此前为了保留未来替换为 Java 的可能性，采用手写 OpenAPI、生成 TypeScript 声明、维护 Fastify JSON Schema、再用契约测试比较两者的链路。随着管理 API 增加，同一请求结构需要在 OpenAPI 和路由 Schema 中重复表达，生成文件和一致性测试进一步增加了维护面。

TypeScript 类型本身不能替代服务端运行时校验。HTTP 请求来自不可信边界，调用方可以绕过前端、篡改请求、使用旧客户端或提交错误类型、缺失字段、越界值和额外字段。类型在编译后会被擦除，给 `FastifyRequest` 添加泛型只会让编译器相信数据合法，不会检查真实 JSON。

## 决策驱动因素

- 当前开发效率优先于尚未立项的跨语言替换能力。
- 请求体、查询参数和路径参数必须在后端边界完成运行时校验。
- 数据结构应只维护一次，并同时产生运行时 Schema 和 TypeScript 类型。
- Swagger 仍应可用于本地调试，但不应成为另一份手写事实源。
- 未来确实引入 Java 或外部调用方时，必须能够导出并审查标准 OpenAPI。

## 考虑的方案

1. 继续 OpenAPI-first，并从 OpenAPI 进一步生成 Fastify Schema。跨语言能力最强，但生成链路和工具复杂度仍然服务于假设需求。
2. 只共享 TypeScript interface。最轻，但不能校验真实 HTTP 输入，也无法可靠生成接口文档。
3. 共享运行时 Schema，并从 Schema 推导 TypeScript 类型。当前只维护一次结构，同时保留校验和按需导出 OpenAPI 的能力。

## 决策

- 新建 `@scaffold/api-contract`，以 TypeBox JSON Schema 作为内部 HTTP 数据契约的唯一来源。
- 请求、查询和路径参数类型从 Schema 静态推导；前后端不得另写平行 interface 描述同一 HTTP 数据。
- Fastify 路由直接使用共享 Schema 执行运行时校验并生成 Swagger/OpenAPI。
- 前端通过轻量共享 HTTP Client 调用接口，业务 API 函数显式使用契约包导出的请求和响应类型。
- 删除手写 `openapi.yaml`、OpenAPI 类型生成步骤和 OpenAPI/Swagger 双源比较测试。
- OpenAPI 作为 Fastify 在 `/docs/json` 生成的可选互操作产物，不提交为日常编辑源。
- 只有跨语言实现、外部 API、多语言 SDK 或独立 API 治理成为现实需求时，才重新评估是否把 OpenAPI 提升为发布契约。

## 正面结果

- 请求结构、约束和 TypeScript 类型来自同一份可执行定义。
- Fastify 在真实 HTTP 边界拒绝非法类型、缺失字段、越界值和未声明字段。
- 日常新增接口不再维护 YAML、生成声明和重复 Schema。
- Swagger 调试能力保留，未来 Java 接入仍可从运行中服务导出 OpenAPI 作为迁移起点。

## 负面结果与风险

- 前后端在当前阶段明确绑定 TypeScript 契约包。
- 自定义 HTTP Client 不再拥有 `openapi-fetch` 的全路径自动推导，需要业务 API 封装明确标注请求和响应类型。
- Fastify 生成的 OpenAPI 在成为外部发布契约前，仍需要独立审查、版本化和兼容性测试。
- TypeBox 成为共享契约的基础依赖，升级时必须验证 JSON Schema 和推导类型行为。

## 验证和复审条件

- 契约包、前后端类型检查和生产构建通过。
- 后端路由测试证明非法请求在进入处理函数前被拒绝。
- `/docs/json` 仍包含全部业务操作和共享 Schema 约束。
- 当第二种后端语言、外部 API 消费者或 SDK 生成被正式立项时复审本决策。

## 相关设计和计划

- [API 契约模块设计](../design/modules/api-contract.md)
- [后端模块设计](../design/modules/backend.md)
- [测试策略](../design/testing-strategy.md)
- [实施计划](../archive/plans/2026-07-23-runtime-schema-contract.md)
