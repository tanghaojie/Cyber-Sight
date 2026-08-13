---
title: 维护者指南与统一 API 响应
date: 2026-07-22
status: completed
---

# 维护者指南与统一 API 响应

## 用户目标和约束

- AI 主导编码，但人类全栈维护者必须能理解和修改项目。
- 维护者可能不熟悉 OpenAPI、Drizzle 和 Vitest，需要详细操作指南。
- 命名函数优先使用 `function name() {}`，不以 `const name = () => {}` 为默认风格。
- 普通响应统一为 `{ status, data?, err? }`，成功码为 `0`。
- 分页请求默认 `pageNum = 1`、`pageSize = 10`，分页响应统一为 `{ status, list, total, err? }`。
- 必须维护错误码文档。

## 方案

- 用 ADR 固化响应、分页和错误码边界。
- OpenAPI 展开具体接口类型，TypeScript 包提供共享泛型。
- 后端提供响应辅助函数和全局错误处理，避免每个模块手写结构。
- 前端统一处理传输错误和业务错误。
- 新增面向人类维护者的完整开发指南与错误码参考表。

## 执行与验证结果

- 完成人类维护者开发指南，覆盖目录职责、OpenAPI、统一响应、Drizzle、Vitest、数据库迁移、文档和提交流程。
- 建立错误码参考表、区间分配和新增错误码流程。
- OpenAPI 新增 `HealthData`、统一 `HealthResponse`、`ErrorResponse`、`PaginationRequest` 和 `PaginationResponse`。
- TypeScript 契约包新增普通响应和分页泛型；后端新增成功、失败、分页和默认值辅助函数。
- Fastify 增加全局 404 和错误处理，避免业务错误返回框架默认结构。
- 前端 health composable 已适配统一响应，并新增成功和失败响应测试。
- 生产源码命名函数优先改为函数声明，对象函数使用方法简写。
- `pnpm gen:api`、`pnpm test`（后端 10、前端 6）、`pnpm build` 和 `pnpm test:db` 均通过。
