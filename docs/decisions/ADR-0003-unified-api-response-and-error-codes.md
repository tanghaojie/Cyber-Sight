---
title: 统一业务响应、分页和错误码
status: superseded
date: 2026-07-22
superseded_by: ADR-0004-http-status-and-frontend-global-error-handling.md
---

# ADR-0003：统一业务响应、分页和错误码

> ADR-0006 仅取代本决策中依赖 OpenAPI 展开具体类型的表达方式。统一响应、分页和错误码语义继续有效；ADR-0007 进一步统一为共享 Zod Schema 与推导类型。

## 背景

AI 和人类会持续增加接口。如果每个模块自行定义成功、失败和分页结构，前端必须编写不同的判断逻辑，错误码也无法检索和治理。

## 决策

- 普通成功响应为 `{ status: 0, data?: T }`。
- 普通失败响应为 `{ status: 非零错误码, err: string }`。
- 分页请求为 `{ pageNum?: number, pageSize?: number }`，默认值为 `1`、`10`。
- 分页响应为 `{ status: number, list: T[], total: number, err?: string }`。
- HTTP 状态码继续表达 HTTP 语义，响应体 `status` 是稳定的业务错误码。
- 通用错误码集中定义在后端代码和 `docs/reference/error-codes.md`；业务模块使用分配的区间。
- OpenAPI 为每个接口展开具体业务类型，TypeScript 共享包同时提供泛型辅助类型。

## 结果

- 前端有统一的成功和失败判断路径。
- 契约、运行时 Schema 和测试必须同步维护一层响应包装。
- 错误响应不返回 `data`，成功响应不返回 `err`。
- 基础设施接口如 Swagger 文档不属于业务 API，可保持其原始协议格式。

## 后续决策

HTTP 状态码的使用范围已由 ADR-0004 调整；其他响应、分页和错误码约定继续有效。

## 错误码区间

- `0`：成功。
- `1000-1999`：通用请求、认证和资源错误。
- `2000-8999`：业务模块错误，各模块在错误码文档登记子区间。
- `9000-9999`：服务端和外部依赖错误。
