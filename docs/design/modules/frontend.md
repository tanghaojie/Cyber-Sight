# 前端模块设计

## 定位

`apps/frontend` 是 Vue 3 单页应用，通过共享 OpenAPI 生成的类型访问后端。更换 Fastify 为 Java 时，前端不应依赖具体服务端框架。

## 当前结构

- `src/views/`：路由页面。
- `src/modules/<module>/composables/`：模块 API 调用和页面状态封装。
- `src/api/`：共享 API Client。
- `@scaffold/openapi-spec`：前后端共享的 OpenAPI 生成类型，禁止手改。
- `src/router/`：路由配置。
- Pinia 已初始化，但当前没有 store。

## 约束

- Vue 组件负责展示和交互，不直接实现复杂业务规则。
- 后端调用通过模块 composable 或 service 封装，不在多个组件中散落路径字符串。
- API 请求和响应类型来自 OpenAPI 生成物。
- 页面必须明确处理 loading、empty、error 和 success 状态。
- 跨页面共享状态才进入 Pinia；局部状态保留在组件或 composable。
- 新业务模块必须提供组件/逻辑测试，并为关键流程提供端到端测试。

前端测试使用 Vitest、Vue Test Utils 和 jsdom。页面测试应隔离网络，通过 mock composable 或 API Client 验证 loading、error 和 success 展示；真实前后端流程留给端到端测试。

## 当前缺口

- 只有健康检查示例，没有统一 UI、错误模型和请求状态规范。
- `useHealth` 成功重试时不会清理旧错误状态。
- 缺少样式体系、可访问性和生产环境 API 地址策略。
