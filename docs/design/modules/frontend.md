# 前端模块设计

## 定位

`apps/frontend` 是 Vue 3 单页应用，通过共享契约包推导的 TypeScript 类型访问后端。前端只依赖 HTTP 路径和数据约定，不依赖 Fastify 路由实现。

## 当前结构

- `src/views/`：路由页面。
- `src/modules/<module>/composables/`：模块 API 调用和页面状态封装。
- `src/api/`：共享 API Client 和 HTTP 401/404/500 全局响应拦截器。
- `@scaffold/api-contract`：由运行时 Schema 推导的请求和响应类型。
- `src/router/`：路由配置。
- Pinia 已初始化，但当前没有 store。
- `src/stores/auth.ts`：跨页面登录态、当前用户和退出流程。
- `src/layouts/AdminLayout.vue`：响应式侧栏、顶栏和内容区应用框架。
- `src/views/admin/ResourceView.vue`：用户、角色、菜单和字典的配置驱动 CRUD 页面。

## 约束

- Vue 组件负责展示和交互，不直接实现复杂业务规则。
- 后端调用通过模块 composable 或 service 封装，不在多个组件中散落路径字符串。
- API 请求和响应类型来自共享运行时 Schema 的推导结果。
- 页面必须明确处理 loading、empty、error 和 success 状态。
- 跨页面共享状态才进入 Pinia；局部状态保留在组件或 composable。
- 新业务模块必须提供组件/逻辑测试，并为关键流程提供端到端测试。
- 共享响应拦截器统一处理 HTTP `401`、`404`、`500` 并发布 `api:global-http-error` 事件；应用壳层监听事件执行登录、404 页面或 500 提示等全局动作。
- 业务模块处理 HTTP `200` 响应中的非零业务 `status`；只有 `status === 0` 且存在预期数据时才进入成功状态。
- 分页页面通过统一的 `pageNum`、`pageSize` 请求和 `list`、`total` 响应维护状态。

前端测试使用 Vitest、Vue Test Utils 和 jsdom。页面测试应隔离网络，通过 mock composable 或 API Client 验证 loading、error 和 success 展示；真实前后端流程留给端到端测试。

## 当前缺口

- 已实现 HTTP 401 对应的登录页和路由守卫；独立 404 页面和全局 500 提示仍待后续补齐。
- `useHealth` 成功重试时不会清理旧错误状态。
- 已建立管理端设计令牌和响应式样式基线；系统化可访问性审计和生产环境 API 地址策略仍待补齐。
