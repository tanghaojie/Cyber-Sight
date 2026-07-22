# API 契约模块设计

## 职责

`packages/openapi-spec/openapi.yaml` 定义前后端以及未来不同后端语言共同遵守的 HTTP API，包括路径、请求、响应、错误和版本信息。

## 当前链路

1. 人或 AI 修改 `openapi.yaml`。
2. 根脚本 `pnpm gen:api` 运行 `openapi-typescript`。
3. 生成 `packages/openapi-spec/src/schema.d.ts`，由契约包统一导出。
4. 前端和 Fastify 后端都从 `@scaffold/openapi-spec` 导入同一份生成类型。
5. 前端通过 `openapi-fetch` 获得类型化调用能力；Fastify 路由用共享响应类型约束实现。
6. 契约测试比较共享 OpenAPI 与 Fastify 暴露的 Swagger 文档，阻止接口漂移。

## 当前风险

Swagger UI 仍使用 Fastify 路由 Schema 生成运行时文档，因此共享 OpenAPI 与运行时 Schema 仍是两种表达。当前通过共享生成类型和契约测试约束一致性；未来可评估直接从 OpenAPI 生成 Fastify Schema。

## 约束

- 所有 API 变化必须从共享 OpenAPI 开始。
- 生成文件不能手工编辑。
- 后端实现必须通过契约测试证明请求和响应符合 OpenAPI。
- Swagger UI 展示内容必须与共享契约一致，不能长期维护独立事实源。
- Java 后端若引入，也必须消费或验证同一份契约。
- 普通业务响应统一使用 `{ status: number, data?: T, err?: string }`；`status = 0` 表示成功，其他值必须来自错误码表。
- 分页请求统一使用可选 `pageNum`、`pageSize`，默认值为 `1`、`10`。
- 分页响应统一使用 `{ status: number, list: T[], total: number, err?: string }`。
- 业务 API 仅以 HTTP `401`、`404`、`500` 表达需要全局处理的未认证、未找到和内部异常；其余错误返回 HTTP `200`。
- HTTP `200` 响应也可能包含非零 `status`，调用方必须根据业务状态判断成功或失败。

## 已采用方案

ADR-0002 决定采用“共享生成类型 + 运行时契约测试”的渐进方案。它先消除前后端编译期类型分叉，同时保留 Fastify 的运行时序列化和 Swagger 能力。后续如重复维护成本继续升高，再单独评估 Schema 自动生成。

ADR-0003 定义统一响应、分页和错误码约定。OpenAPI 3.0 不支持真正的泛型，因此每个接口仍要在契约中定义具体 `data` 或 `list` 项类型；TypeScript 侧通过共享泛型减少重复。

ADR-0004 定义 HTTP 状态与前端全局处理边界。存在业务失败的接口必须在 OpenAPI 的 `200` 响应中覆盖成功体和该接口可能返回的错误体，并单独声明可能出现的 `401`、`404`、`500`。
