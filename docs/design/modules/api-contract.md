# API 契约模块设计

## 职责

`packages/api-contract` 是 TypeScript/Vue 前端与 TypeScript/Fastify 后端之间的内部 HTTP 契约包。它定义请求体、查询参数、路径参数、响应数据和公共包装的运行时 JSON Schema，并从同一份 Schema 推导 TypeScript 类型。

## 为什么不能只共享 TypeScript 类型

TypeScript 只能检查参与编译的源码，类型在运行时会被擦除。后端收到的是外部 JSON；调用方可以绕过前端、篡改请求、继续使用旧版本客户端，或者提交错误类型、缺失字段、非法枚举、越界值和额外字段。

给 `FastifyRequest` 标注泛型只是在编译期告诉 TypeScript 相信该数据合法，并不会检查真实请求。如果没有边界校验，非法输入会继续进入业务逻辑、数据库、权限判断和外部依赖，最终形成难以定位的 500、脏数据或安全问题。

因此 HTTP 输入必须遵循以下链路：

```text
不可信 HTTP JSON
        |
        v
共享运行时 Schema 校验
        |
        v
已验证的 TypeScript 数据
        |
        v
应用与领域逻辑
```

校验集中在系统边界：HTTP 请求、环境变量、外部服务响应、消息和文件。内部已经由可信代码构造的数据不做无意义的层层重复解析。

## 当前链路

1. 人或 AI 在 `@scaffold/api-contract` 中定义或修改 Zod 4 Schema。
2. TypeScript 类型通过 `z.infer<typeof Schema>` 从 Schema 推导。
3. 契约包通过 `toFastifySchema()` 将 Zod Schema 转换为 Draft 7 JSON Schema，并移除根级 `$schema`。
4. Fastify 路由使用派生 JSON Schema 执行输入校验与响应序列化。
5. 前后端从 `@scaffold/api-contract` 导入同一组请求和响应类型。
6. 前端业务 API 通过共享 fetch Client 发起请求，并处理统一响应。
7. Fastify Swagger 从路由 Schema 生成 `/docs` 和 `/docs/json`；该 OpenAPI 是调试与互操作产物，不是另一份手写源。

## 约束

- HTTP 数据结构必须先用共享 Zod Schema 定义，禁止在前端和后端维护平行 interface。
- 所有外部请求体、查询参数和路径参数必须由后端运行时 Schema 校验。
- 请求对象默认拒绝未声明字段；Fastify AJV 的 `removeAdditional` 保持为 `false`，避免静默删除后继续处理。字符串长度、数值范围、格式和枚举应在 Schema 中明确表达。
- 前端导入契约类型时优先使用 `import type`，不把运行时校验库打入无关业务代码。
- HTTP 契约只使用可稳定转换为 JSON Schema 的 Zod 子集；`transform`、`Date`、集合和无法表达的自定义规则不进入传输 Schema。
- Swagger/OpenAPI 由 Fastify 路由生成，禁止再提交手写 YAML 与运行时 Schema 双源。
- 普通业务响应统一使用 `{ status: number, data?: T, err?: string }`；分页和 HTTP 状态策略沿用 ADR-0003、ADR-0004。
- 未来 Java、外部 API 或 SDK 需求正式立项时，从 `/docs/json` 导出、审查并版本化 OpenAPI，再决定是否升级为发布契约。

## 失败模式

- Zod Schema 未经 `toFastifySchema()` 挂到路由：类型看似正确，但请求不会在边界被拒绝。路由测试必须覆盖非法输入。
- 使用不可转换的 Zod 能力：契约包构建或启动转换会失败。复杂业务校验应放在应用层。
- Schema 和处理函数使用了不同类型：必须从共享 Schema 推导类型，不能手写近似类型。
- 响应 Schema 缺字段：Fastify 序列化可能过滤未声明字段。路由测试必须断言完整响应。
- 前端错误地把 HTTP 200 当成功：业务模块仍必须检查非零 `status`。

## 测试策略

- 契约包通过 TypeScript 构建验证 Zod Schema 与推导类型，后端转换测试验证派生的 Draft 7 JSON Schema 有效。
- 后端使用 `Fastify.inject` 测试合法与非法输入、默认值、额外字段和响应序列化。
- Swagger 测试只验证运行时路由确实暴露预期操作和关键约束，不再比较第二份 OpenAPI。
- 前端测试 mock 共享 Client，验证成功、业务失败和全局 HTTP 错误边界。

## 决策依据

ADR-0006 取代 ADR-0001 和 ADR-0002，ADR-0007 进一步统一为 Zod 4 Schema 编写源。共享运行时 Schema 在不放弃安全边界的前提下消除结构重复，并保留按需生成 OpenAPI 的退出路径。
