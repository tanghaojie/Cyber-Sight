---
title: 共享运行时 Schema 契约迁移
status: completed
created: 2026-07-23
updated: 2026-07-23
---

# 共享运行时 Schema 契约迁移

## 目标

以共享 TypeBox 运行时 Schema 替换 OpenAPI-first 双源链路，在保留 Fastify 请求校验、TypeScript 类型安全和 Swagger 文档的同时，降低新增接口的维护成本。

## 背景与设计依据

原有手写 OpenAPI、生成类型、Fastify JSON Schema 和契约比较测试重复描述相同结构。ADR-0006 决定让运行时 Schema 成为内部契约源，OpenAPI 降级为按需生成物。

## 范围

- 将 `@scaffold/openapi-spec` 替换为 `@scaffold/api-contract`。
- 建立共享请求、响应和公共 Schema 及其推导类型。
- 后端路由直接消费共享 Schema。
- 用轻量 fetch Client 替换 `openapi-fetch`。
- 删除 OpenAPI YAML、生成脚本和双源比较测试。
- 更新架构、测试、维护指南和仓库 AI 规则。

## 非目标

- 不改变现有业务 URL、响应包装、错误码和数据库模型。
- 不引入 Java 实现。
- 不把当前 Swagger JSON 固化为外部发布契约。
- 不进行页面视觉或业务功能重构。

## 前置条件和风险

- TypeBox 成为新的 workspace 依赖。
- 前端 API mock 和调用签名需要同步调整。
- 响应 Schema 启用后必须确认序列化结果没有丢失字段。

## 实施任务

- [x] 创建共享运行时 Schema 契约包。
- [x] 迁移后端类型、请求校验和 Swagger Schema。
- [x] 替换前端 HTTP Client 和业务 API 调用。
- [x] 删除 OpenAPI-first 生成与比较链路。
- [x] 增加非法输入和生成文档测试。
- [x] 更新全部相关文档与索引。
- [x] 运行测试和构建并提交改动。

## 测试与验证

- `pnpm test` 通过：契约包编译、后端 34 项、前端 19 项测试通过。
- `pnpm build` 通过：共享契约、后端和前端生产构建成功。
- 后端 `inject` 证明额外登录字段和 `pageSize > 100` 在处理函数前被拒绝。
- `/docs/json` 包含健康、认证及全部管理操作，并展示共享请求约束。
- 数据库模型未变化，未运行数据库迁移与 `pnpm test:db`。

## 发布与回滚

本次不改变对外 URL 和成功/失败响应约定。回滚时可恢复上一提交的 OpenAPI 包、生成脚本和 `openapi-fetch` Client；数据库无变化。

## 实际偏差和遗留问题

- Fastify 默认会移除 `additionalProperties: false` 对应的额外字段。实施中将 AJV `removeAdditional` 显式设为 `false`，使额外字段触发统一参数错误，符合严格边界校验目标。
- 为保证全新工作区在 `dist` 尚不存在时也能启动，根 `dev`、`test:watch` 会先构建契约包，契约包随后进入监听模式。
- Vite 继续报告已有 CJS Node API 弃用警告，不影响本次交付。
- 未来 Java 或外部 API 需求立项时，需要另行审查、版本化 Fastify 生成的 OpenAPI。

## 相关设计、ADR 和 AI 日志

- [ADR-0006](../decisions/ADR-0006-runtime-schema-as-api-contract.md)
- [API 契约模块设计](../../design/modules/api-contract.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-23-runtime-schema-contract.md)
- 关联提交：`refactor: replace OpenAPI-first with runtime schemas`
