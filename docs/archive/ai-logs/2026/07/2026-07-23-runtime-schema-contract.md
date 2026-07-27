---
title: 从 OpenAPI-first 迁移到共享运行时 Schema
date: 2026-07-23
status: completed
---

# 从 OpenAPI-first 迁移到共享运行时 Schema

## 用户目标和约束

用户认为为了未来可能的 Java 接入持续维护 OpenAPI 过重，要求解释后端运行时校验的必要性，将解释补入文档，并开始修改项目。

## 关键问答与确认

- 当前尚无 Java 实现或外部 API 消费者。
- 不能用纯 TypeScript interface 替代运行时校验，因为真实 HTTP JSON 不受编译器约束。
- 目标是减少事实源，而不是取消服务端输入校验。

## AI 的重要假设

- 保持现有 URL、响应包装、HTTP 状态策略和业务行为不变。
- Swagger 继续服务于本地调试，OpenAPI 不再作为提交到仓库的手写源。
- TypeBox JSON Schema 适合直接交给 Fastify，并可推导共享 TypeScript 类型。

## 方案和执行摘要

已建立 `@scaffold/api-contract`，由共享 TypeBox Schema 同时承担 Fastify 校验、Swagger 生成和 TypeScript 类型推导；前端改用轻量 fetch Client；删除 OpenAPI YAML、生成声明和双源比较测试。Fastify AJV 显式关闭 `removeAdditional`，保证额外字段被拒绝而不是静默移除。

## 验证结果

- `pnpm test` 通过：契约包 TypeScript 编译、后端 34 项测试、前端 19 项测试全部通过。
- 新测试证明登录请求额外字段和越界分页参数会在 HTTP 边界返回统一参数错误。
- Swagger JSON 包含健康、认证和全部管理操作，并保留共享 Schema 的必填、长度和额外字段约束。
- `pnpm build` 通过：契约包、后端 TypeScript 和前端生产构建全部成功。
- Vite 仍输出已有 CJS Node API 弃用警告，不影响构建。
- 本次没有数据库模型变化，因此未运行数据库迁移或 `test:db`。

## 未决问题与下一步

无功能阻塞。未来只有在 Java、外部 API 或多语言 SDK 正式立项时，才复审是否发布并版本化 OpenAPI。

## 相关设计、ADR、计划和提交

- [ADR-0006](../../../../decisions/ADR-0006-runtime-schema-as-api-contract.md)
- [实施计划](../../../plans/2026-07-23-runtime-schema-contract.md)
- 关联提交：`refactor: replace OpenAPI-first with runtime schemas`
