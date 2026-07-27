# 前端模块设计

## 定位

`apps/frontend` 是 Vue 3 单页应用，通过共享契约包推导的 TypeScript 类型访问后端。前端只依赖 HTTP 路径和数据约定，不依赖 Fastify 路由实现。

## 当前结构

- `src/modules/<module>/pages/`：各业务模块拥有的路由页面。
- `src/modules/<module>/`：模块 API、页面状态和唯一公共入口。
- `src/api/`：共享 API Client 和 HTTP 401/404/500 全局响应拦截器。
- `@scaffold/api-contract`：由运行时 Schema 推导的请求和响应类型。
- `src/router/`：路由配置。
- Pinia 已初始化并用于认证 store。
- `src/modules/auth/auth.store.ts`：跨页面登录态、当前用户、清会话和退出流程。
- `src/layouts/AdminLayout.vue`：响应式应用壳编排。
- `src/components/layout/`：侧栏、顶栏和动态内容承载区。
- `src/modules/navigation`：当前用户数据库菜单树与加载状态。
- `src/router/view-registry.ts`：受控页面组件注册表。
- `src/modules/users|roles|menus|dictionaries`：四个相互独立的管理页面和 API service。

## 约束

- 新业务能力必须建立 `src/modules/<module>/` 独立目录，并以 `index.ts` 作为公共入口。模块拥有自己的页面、组件、composable、service、局部 store 和测试；`src/router/`、`src/views/` 与 `src/stores/` 中的存量业务代码在实质修改时迁入对应模块。
- 路由和应用壳只能从模块公共入口加载业务页面或注册信息；禁止一个模块深层导入另一个模块的组件、composable、service 或 store。
- 跨模块状态和操作通过目标模块公开的只读查询、命令或事件协作。不得直接修改其他模块的 Pinia store；真正领域无关的 UI 与 Client 能力才进入共享目录。
- Vue 组件负责展示和交互，不直接实现复杂业务规则。
- 后端调用通过模块 composable 或 service 封装，不在多个组件中散落路径字符串。
- API 请求和响应类型来自共享运行时 Schema 的推导结果。
- 页面必须明确处理 loading、empty、error 和 success 状态。
- 跨页面共享状态才进入 Pinia；局部状态保留在组件或 composable。
- 新业务模块必须提供组件/逻辑测试，并为关键流程提供端到端测试。
- 布局和视觉样式优先使用 Tailwind CSS；表格、表单、弹窗和反馈等通用交互优先使用 Element Plus，并通过项目视觉令牌统一主题。
- 共享响应拦截器统一识别 HTTP `401`、`404`、`500` 并调用应用启动时注册的处理器；401 清状态并跳登录、404 跳错误页、500 使用 ElMessage 显示 `err`。
- 业务模块处理 HTTP `200` 响应中的非零业务 `status`；只有 `status === 0` 且存在预期数据时才进入成功状态。
- 分页页面通过统一的 `pageNum`、`pageSize` 请求和 `list`、`total` 响应维护状态。

前端测试使用 Vitest、Vue Test Utils 和 jsdom。页面测试应隔离网络，通过 mock composable 或 API Client 验证 loading、error 和 success 展示；真实前后端流程留给端到端测试。

## 当前缺口

- 已实现 HTTP 401 登录重定向、独立 404 页面和全局 500 提示；后续需补充端到端浏览器自动化。
- `useHealth` 成功重试时不会清理旧错误状态。
- 已建立 Tailwind CSS、Element Plus 主题令牌和响应式样式基线；系统化可访问性审计和生产环境 API 地址策略仍待补齐。
