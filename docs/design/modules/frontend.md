# 前端模块设计

## 定位

`apps/frontend` 是 Vue 3 单页应用，通过共享契约包推导的 TypeScript 类型访问后端。前端只依赖 HTTP 路径和数据约定，不依赖 Fastify 路由实现。

## 当前结构

- `src/modules/<module>/pages/`：各业务模块拥有的路由页面。
- `src/modules/<module>/`：模块 API、页面状态和按职责命名的公共文件。
- `src/api/`：共享 API Client 和 HTTP 401/404/500 全局响应拦截器。
- `@scaffold/api-contract`：由运行时 Schema 推导的请求和响应类型。
- `src/router/`：路由配置。
- Pinia 已初始化并用于认证 store。
- `src/modules/auth/auth.store.ts`：跨页面登录态、当前用户、Bearer token 持久化、清会话和退出流程。
- `src/layouts/AdminLayout.vue`：响应式应用壳编排。
- `src/components/layout/`：侧栏、顶栏和动态内容承载区。
- `src/modules/navigation`：当前用户数据库菜单树与加载状态。
- `src/modules/**/view-registry.ts`：模块拥有的动态页面注册清单。
- `src/router/view-registry.ts`：构建期自动发现、冲突校验和只读注册表组装。
- `src/shared/routing/layout-registry.ts`：自动发现 `src/layouts/*.vue` 并提供只读布局注册表与表单选项。
- `src/assets/icons/*.svg`、`src/shared/icons/icon-registry.ts` 与 `src/components/AppIcon.vue`：由 Vite 构建期发现图标源、生成 sprite/只读选项，并通过稳定名称渲染。
- `src/styles/main.scss`：只负责组合 Tailwind、基础样式、布局样式和按 Element Plus 组件拆分的 SCSS 覆盖。
- `src/modules/users|roles|menus|dictionaries`：四个相互独立的管理页面和 API service。

## 约束

- 新业务能力必须建立 `src/modules/<module>/` 独立目录，并通过 `*.routes.ts`、`*.store.ts`、`*.api.ts`、`view-registry.ts` 等表意文件暴露公共能力，避免创建 `index.ts` 或无差别转发的 barrel。模块拥有自己的页面、组件、composable、service、局部 store 和测试；`src/router/`、`src/views/` 与 `src/stores/` 中的存量业务代码在实质修改时迁入对应模块。
- 路由和应用壳只能从模块设计中登记的公共文件加载业务页面、状态或注册信息；禁止一个模块导入另一个模块未登记的组件、composable、service 或 store。
- 当前公共文件包括：`auth/auth.store.ts`、`auth/auth.routes.ts`、`navigation/navigation.store.ts`、`errors/error.routes.ts`、各管理模块的 `*.api.ts`，以及由路由组合根按约定发现的 `view-registry.ts`。`menus/menu-options.ts` 是角色模块读取菜单选项的公共用例文件。
- 需要被数据库菜单选择的模块页面必须在本模块 `view-registry.ts` 的 `registerViews()` 中显式登记稳定组件标识；路由组合根自动发现该约定文件，禁止中心注册表继续手工导入业务模块。组件标识必须非空且全局唯一。
- 菜单可选择的布局由 `src/layouts/` 根目录中的 `.vue` 文件名提供稳定标识；动态路由只加载构建期注册的布局。菜单显式布局覆盖目录继承值，空值最终回退 `AdminLayout`。目录站内路径作为后代前缀，子节点相对路径在其下拼接，绝对路径覆盖该前缀。
- 菜单可选择的图标只能来自 `src/assets/icons/*.svg` 的构建期名称清单；新增 SVG 文件即可进入选项，不在 Vue 组件中维护图形分支。
- 跨模块状态和操作通过目标模块公开的只读查询、命令或事件协作。不得直接修改其他模块的 Pinia store；真正领域无关的 UI 与 Client 能力才进入共享目录。
- Vue 组件负责展示和交互，不直接实现复杂业务规则。
- 后端调用通过模块 composable 或 service 封装，不在多个组件中散落路径字符串。
- 共享 API Client 从领域无关的 access-token 存储读取 token，并为请求统一附加 `Authorization: Bearer <token>`；认证 store 负责在登录、退出和 HTTP 401 时写入或清除 token。
- API 请求和响应类型来自共享运行时 Schema 的推导结果。
- 页面必须明确处理 loading、empty、error 和 success 状态。
- 跨页面共享状态才进入 Pinia；局部状态保留在组件或 composable。
- 新业务模块必须提供组件/逻辑测试，并为关键流程提供端到端测试。
- 布局和视觉样式优先使用 Tailwind CSS；需要全局维护的样式使用 SCSS 并按基础样式、布局职责和第三方组件边界拆分。表格、表单、弹窗和反馈等通用交互优先使用 Element Plus；其全局变量与每类组件覆盖不得混放在 `main.scss`。
- 共享响应拦截器统一识别 HTTP `401`、`404`、`500` 并调用应用启动时注册的处理器；401 清状态并跳登录、404 跳错误页、500 使用 ElMessage 显示 `err`。
- 业务模块处理 HTTP `200` 响应中的非零业务 `status`；只有 `status === 0` 且存在预期数据时才进入成功状态。
- 分页页面通过统一的 `pageNum`、`pageSize` 请求和 `list`、`total` 响应维护状态。

前端测试使用 Vitest、Vue Test Utils 和 jsdom。页面测试应隔离网络，通过 mock composable 或 API Client 验证 loading、error 和 success 展示；真实前后端流程留给端到端测试。

## 当前缺口

- 已实现 HTTP 401 登录重定向、独立 404 页面和全局 500 提示；后续需补充端到端浏览器自动化。
- `useHealth` 成功重试时不会清理旧错误状态。
- 已建立 Tailwind CSS、Element Plus 主题令牌和响应式样式基线；系统化可访问性审计和生产环境 API 地址策略仍待补齐。
