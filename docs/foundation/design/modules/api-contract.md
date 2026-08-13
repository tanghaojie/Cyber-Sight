# API 契约模块设计

## 职责

`packages/api-contract` 是 TypeScript/Vue 前端与 TypeScript/NestJS 后端之间的内部 HTTP 契约包。它定义请求体、查询参数、路径参数、响应数据和公共包装的运行时 Zod Schema，并从同一份 Schema 推导 TypeScript 类型。

## 为什么不能只共享 TypeScript 类型

TypeScript 只能检查参与编译的源码，类型在运行时会被擦除。后端收到的是外部 JSON；调用方可以绕过前端、篡改请求、继续使用旧版本客户端，或者提交错误类型、缺失字段、非法枚举、越界值和额外字段。

给 Controller 参数标注 TypeScript 类型只是在编译期告诉编译器相信该数据合法，并不会检查真实请求。如果没有运行时 Pipe，非法输入会继续进入业务逻辑、数据库、权限判断和外部依赖，最终形成难以定位的 500、脏数据或安全问题。

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

1. 人或 AI 在 `@cyber-ai-forge/api-contract` 中定义或修改 Zod 4 Schema。
2. TypeScript 类型通过 `z.infer<typeof Schema>` 从 Schema 推导。
3. Nest Controller 通过 `ZodValidationPipe` 直接解析请求，通过 `ContractResponseInterceptor` 校验响应。
4. 契约包通过 `toOpenApiSchema()` 为 Nest Swagger 派生 OpenAPI Schema；`toJsonSchema()` 仅用于适配器无关的 JSON Schema 输出。
5. 前后端从 `@cyber-ai-forge/api-contract` 导入同一组请求和响应类型。
6. 前端业务 API 通过共享 fetch Client 发起请求，并处理统一响应。
7. Nest Swagger 从 `ContractRoute` 元数据生成 `/docs` 和 `/docs/json`；该 OpenAPI 是调试与互操作产物，不是另一份手写源。

## 约束

- Foundation 请求、响应和事件 Schema 放在 `src/foundation/modules/<module>/`，Platform Schema 放在 `src/platform/modules/<module>/`；两者都通过 `<module>.schema.ts`、`<module>.types.ts` 等表意文件暴露公共契约，避免模块级 `index.ts`。同一能力在前端、后端和契约层保持相同模块名。Platform 可以依赖已登记的 Foundation Schema，Foundation 禁止导入 Platform。
- 契约包的包级发布入口只显式聚合各模块已登记的公共 Schema 和真正通用的包装类型，不得直接导出模块内部辅助 Schema。一个模块不得从另一个模块未登记的文件拼装契约；确需组合时只能使用对方公开的稳定 Schema。存量入口在模块实质修改时逐步迁移。
- HTTP 数据结构必须先用共享 Zod Schema 定义，禁止在前端和后端维护平行 interface。
- 所有外部请求体、查询参数和路径参数必须由后端运行时 Schema 校验。
- 请求对象默认使用严格 Zod 对象拒绝未声明字段，避免静默删除后继续处理。字符串长度、数值范围、格式和枚举应在 Schema 中明确表达；HTTP 查询与路径数字使用显式 coercion。
- 应用实体 ID 统一复用 `EntityIdSchema`/`EntityId`，运行时接受非 nil UUID 字符串；路径参数、响应 ID、关联 ID 和数组不得重新声明为数字或普通无校验字符串。
- 前端导入契约类型时优先使用 `import type`，不把运行时校验库打入无关业务代码。
- HTTP 契约只使用可稳定转换为 JSON Schema 的 Zod 子集；`transform`、`Date`、集合和无法表达的自定义规则不进入传输 Schema。
- Swagger/OpenAPI 由 Nest Controller 的契约元数据生成，禁止再提交手写 YAML 与运行时 Schema 双源。
- 普通业务响应统一使用 `{ status: number, data?: T, err?: string }`；分页响应统一使用 `{ status, list, total, err? }`。业务 API 仅把未认证、资源不存在和内部异常映射为 HTTP `401`、`404`、`500`，其他业务失败使用 HTTP `200` 和非零 `status`。
- 未来 Java、外部 API 或 SDK 需求正式立项时，从 `/docs/json` 导出、审查并版本化 OpenAPI，再决定是否升级为发布契约。

## 失败模式

- Zod Schema 未经 `ZodValidationPipe` 挂到 Controller 参数：类型看似正确，但请求不会在边界被拒绝。路由测试必须覆盖非法输入。
- 使用不可转换的 Zod 能力：契约包构建或启动转换会失败。复杂业务校验应放在应用层。
- Schema 和处理函数使用了不同类型：必须从共享 Schema 推导类型，不能手写近似类型。
- 响应 Schema 与处理结果不一致：全局契约 Interceptor 会拒绝响应并转为内部错误。路由测试必须断言完整响应。
- 前端错误地把 HTTP 200 当成功：业务模块仍必须检查非零 `status`。
- 开发 watch 只运行 `tsc`：源码别名会原样进入 `dist`，覆盖此前可运行的构建产物；TypeScript
  与别名改写必须同时监听，正式构建必须扫描别名残留并导入包入口。

## 测试策略

- 契约包通过 TypeScript 构建验证 Zod Schema 与推导类型，并扫描 `dist` 中的 `@/` 残留、使用
  Node.js 导入包入口；后端转换测试验证派生的 Draft 7 JSON Schema 有效。
- 后端通过 Nest 应用的 Fastify adapter `inject` 测试合法与非法输入、默认值、额外字段和响应契约。
- Swagger 测试只验证运行时路由确实暴露预期操作和关键约束，不再比较第二份 OpenAPI。
- 前端通过 TypeScript 与生产构建验证契约消费可以解析；成功、业务失败和全局 HTTP 错误
  行为由维护者人工验收。

## 当前依据

共享 Zod 4 运行时 Schema 在不放弃安全边界的前提下消除结构重复，并保留按需生成 OpenAPI 的退出路径。初始版本形成过程中的契约 ADR 已归档，当前规则直接以本设计、共享 Schema 和转换测试为准。
