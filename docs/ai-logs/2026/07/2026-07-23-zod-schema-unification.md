---
title: 统一使用 Zod Schema
date: 2026-07-23
status: completed
---

# 统一使用 Zod Schema

## 用户目标和约束

用户指出 TypeBox 与已有 Zod 形成重复工具栈，确认采用 Zod 4 作为唯一 Schema 编写源，并要求实施。

## 关键问答与确认

- 当前 Zod 只校验环境变量，TypeBox 定义 HTTP 契约；没有同一结构双写，但存在两套 API。
- 保留后端运行时校验、Swagger 和前后端类型推导。
- 不为统一 Schema 同时升级 Fastify 5。

## AI 的重要假设

- Zod 4 Schema 使用 `z.strictObject()` 与当前严格额外字段策略保持一致。
- HTTP 传输契约限制在可转换为 Draft 7 JSON Schema 的 Zod 子集。
- Fastify 继续使用 AJV 和响应序列化器，Zod 是唯一的人类编写源。

## 方案和执行摘要

已升级到 Zod 4，以 `z.infer` 推导类型，通过契约包统一函数调用 `z.toJSONSchema(..., { target: 'draft-7' })` 并移除根级 `$schema`，后端路由只消费派生 JSON Schema。HTTP 契约全部改为 `z.strictObject()` 等可稳定转换的 Zod 子集；环境变量继续直接使用 `safeParse`。

## 验证结果

- `pnpm test` 通过：契约包 TypeScript 编译、后端 35 项测试和前端 19 项测试全部通过。
- 新增转换测试验证 Draft 7 输出不含根级 `$schema`，并保留严格对象、必填、长度、分页范围和默认值。
- 现有 HTTP 边界测试继续证明额外字段和越界分页参数会返回统一参数错误。
- Swagger JSON 仍包含健康、认证和全部管理操作。
- `pnpm build` 通过：契约包、后端 TypeScript 与前端生产构建全部成功。
- TypeBox 已从包依赖和 lockfile 移除，前端生产 bundle 未包含 Zod。
- Vite 仍输出已有 CJS Node API 弃用警告，不影响交付。

## 未决问题与下一步

无功能阻塞。未来升级 Fastify 5 时，再单独评估是否采用与当前版本兼容的 Zod Type Provider。

## 相关设计、ADR、计划和提交

- [ADR-0007](../../../decisions/ADR-0007-zod-as-unified-schema-source.md)
- [实施计划](../../../plans/archive/2026-07-23-zod-schema-unification.md)
- 关联提交：`refactor: unify runtime schemas on Zod`
