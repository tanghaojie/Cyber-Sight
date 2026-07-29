---
title: Zod Schema 统一迁移
status: completed
created: 2026-07-23
updated: 2026-07-23
---

# Zod Schema 统一迁移

## 目标

用 Zod 4 取代共享契约中的 TypeBox，使环境变量和 HTTP 契约只使用一套 Schema 编写 API，同时保留现有 Fastify 4 运行时校验、响应序列化和 Swagger。

## 背景与设计依据

ADR-0007 决定使用 Zod 4 作为唯一 Schema 编写源，通过原生 `z.toJSONSchema` 生成 Draft 7 JSON Schema 给 Fastify，不同时升级 Fastify 和 Swagger。

## 范围

- 将 `@scaffold/api-contract` 的 TypeBox Schema 改为 Zod 4 Schema。
- 将所有 `Static` 类型改为 `z.infer`。
- 增加统一 `toFastifySchema()` 转换边界。
- 更新后端路由以使用派生 JSON Schema。
- 升级 Zod、移除 TypeBox并更新 lockfile。
- 更新架构、维护指南、测试和 AI 规则。

## 非目标

- 不升级 Fastify 5、Swagger 9 或接入 Zod Type Provider。
- 不改变业务 URL、响应包装、错误码、数据库和页面行为。
- 不在 HTTP Schema 中引入无法转换的 Zod transform 或业务异步校验。

## 前置条件和风险

- Zod 4 JSON Schema 输出必须与 Fastify 4 的 Draft 7 AJV 兼容。
- 根级 `$schema` 不能作为嵌套路由 Schema 传给 Swagger，需要由转换函数移除。
- Zod 对可选、严格对象、格式和 union 的输出需要回归测试。

## 实施任务

- [x] 创建 Zod Schema 与推导类型。
- [x] 更新 Fastify 路由 JSON Schema 转换。
- [x] 升级依赖并移除 TypeBox。
- [x] 增加转换和边界校验测试。
- [x] 更新文档和索引。
- [x] 运行测试、构建并提交。

## 测试与验证

- `pnpm test` 通过：契约包编译、后端 35 项、前端 19 项测试通过。
- `pnpm build` 通过：共享契约、后端和前端生产构建成功。
- 依赖与 lockfile 已不再引用 TypeBox；后端和契约包统一使用 Zod 4.4.3。
- 转换测试验证根级 `$schema` 已移除，严格对象、必填、长度、分页范围和默认值均保留。
- `/docs/json` 回归测试通过，Fastify 仍从实际路由生成认证及全部管理操作。

## 发布与回滚

无数据库和 HTTP 语义变化。回滚可恢复上一提交的 TypeBox 契约包和依赖；Fastify、Swagger 与业务实现不变。

## 实际偏差和遗留问题

- 原计划成立，没有升级 Fastify、Swagger 或引入 Zod Type Provider。
- 分页字段通过 Zod metadata 生成 JSON Schema `default`，从而同时保留 `z.infer` 的可选字段语义和 Fastify 的默认值注入。
- 转换回归测试放在后端测试中，与实际 Fastify/Swagger 链路一起验证。
- Vite 继续报告已有 CJS Node API 弃用警告，不影响本次测试和构建。
- 无数据库变更，因此没有运行迁移或 `pnpm test:db`。

## 相关设计、ADR 和 AI 日志

- [ADR-0007](../decisions/ADR-0007-zod-as-unified-schema-source.md)
- [API 契约模块设计](../../design/modules/api-contract.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-23-zod-schema-unification.md)
- 关联提交：`refactor: unify runtime schemas on Zod`
