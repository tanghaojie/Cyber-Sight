---
title: 前端应用与应用壳
status: active
owner: maintainers
updated: 2026-07-30
---

# 前端应用与应用壳

## 定位与边界

`apps/frontend` 是 Vue 3 单页应用，通过 `@scaffold/api-contract` 推导的 TypeScript 类型访问后端。它拥有应用启动、认证状态、静态与动态路由、响应式管理端外壳和各前端业务模块；不依赖 Fastify 内部实现，也不把数据库字符串当作任意动态导入路径。

业务页面、API 和状态按类别归属：脚手架内置能力位于 `src/modules/system/<module>/`，后续产品业务位于 `src/modules/biz/<module>/`。`src/router/`、`src/layouts/`、`src/bootstrap/`、`src/api/` 和领域无关的 `src/shared/` 只承担应用组合或平台能力，不承载具体业务规则。

## 当前结构与公共边界

- `src/modules/system/<module>/pages/`、`src/modules/biz/<module>/pages/`：模块路由页面；`pages/components/`：仅供所属页面使用的列表和 Dialog。
- `src/modules/{system,biz}/<module>/*.api.ts`：模块 HTTP 调用；`*.store.ts`：确需跨页面共享的 Pinia 状态。
- `src/modules/{system,biz}/**/registerViews.ts`：需要被数据库菜单选择的模块登记页面加载器。
- `src/shared/routing/view-registry.ts`：构建期发现全部 `registerViews.ts`，校验稳定 key 并冻结页面注册表。
- `src/shared/routing/layout-registry.ts`：发现 `src/layouts/*.vue`，以文件名建立只读布局注册表；`AdminLayout` 必须存在。
- `src/router/constRoutes.ts`：登录、显式 404、根 `AdminLayout` 和默认工作台路由。
- `src/router/routerGuard.ts`：认证恢复、导航加载和首次动态路由安装。
- `src/router/dynamicRoutes.ts`：根据菜单树生成、注册和清理动态路由。
- `src/router/index.ts`：创建 Router，组装静态路由、最终 404 和认证守卫。
- `src/bootstrap/registerHttpErrorHandler.ts`：组装 Router、认证、导航和全局 HTTP 错误动作。
- `src/components/layout/` 与 `src/layouts/AdminLayout.vue`：侧栏、顶栏、内容出口和移动抽屉。
- `src/layouts/EmptyLayout.vue`：只提供一个 `<router-view>` 的可选布局。
- `src/assets/icons/*.svg`、`src/shared/icons/icon-registry.ts` 与 `src/components/AppIcon.vue`：构建期 SVG sprite 和稳定图标名称。

模块外部只能依赖模块设计登记的表意公共文件。禁止新增无差别 `index.ts` barrel，禁止跨模块导入页面、私有 composable、内部状态或未登记 service。用户模块通过角色和部门 API 读取归属选项；用户、角色和部门弹窗复用 authorization 的 `DataPolicyEditor.vue` 与 API；菜单弹窗通过 authorization API 读取权限目录。

## 认证数据流

1. `auth.api.ts` 封装登录、当前用户和退出请求，`auth.store.ts` 只编排状态、错误文案和 token 生命周期。
2. 登录成功数据为 `{ user, issued: { token, expiresAt } }`。store 通过 `shared/accessToken.ts` 把 token 写入 `jtlib_access_token` cookie，并使用服务端返回时间作为到期时间。
3. 共享 API Client 从 token 适配器读取值并附加 `Authorization: Bearer <token>`。
4. 退出或 HTTP 401 清除认证、导航和动态路由状态；token 适配器同时移除 cookie 与旧 `localStorage` 键。
5. `api/result.ts` 在后端既没有合法成功响应也没有错误响应时显示统一消息并抛出异常；HTTP `200` 中的非零业务 `status` 仍由调用模块处理。

cookie 当前由浏览器 JavaScript 管理，不是服务端 `HttpOnly` cookie；其安全边界仍依赖同源 XSS 防护和 Bearer token 规则。

## 导航与路由数据流

1. `constRoutes.ts` 直接注册公开登录、公开 404，以及使用 `AdminLayout` 的 `/` 根路由和默认 `HomePage`。
2. 非公开导航进入 `authenticationRouteGuard()`：恢复当前用户；未认证时跳转登录；首次认证成功时加载菜单树、安装动态路由并按原地址重新匹配。
3. `navigation.store.ts` 通过 `navigation.api.ts` 获取 `GET /navigation/menus`，先把相对路径按目录层级解析为规范绝对路径，再缓存树和扁平列表。
4. `dynamicRoutes.ts` 递归生成路由。`directory` 使用显式布局或 `RouterView` 并承载子路由；`menu` 使用已登记页面，显式布局存在时创建只有一个空路径子项的布局包装，否则直接加载页面；`button` 不注册站内路由。菜单路由的 `meta.menuPath` 保存从根目录到当前页面的菜单名称路径，应用壳在原副标题位置展示该路径，不再使用抽象的 `eyebrow` 元数据。
5. 每棵根菜单子树通过 `router.addRoute()` 注册。刷新菜单、退出或 401 时调用移除函数并重置 `routesReady`。
6. `SidebarTree.vue` 只渲染有子项的目录、站内菜单和外链按钮；空目录不会显示。外链按钮仅打开 HTTP(S) 地址。

目录层级通过嵌套路由自然传递上级布局：目录无显式布局时使用 `RouterView`，菜单无显式布局时直接使用页面。当前实现不会为所有动态根菜单自动包裹 `AdminLayout`；需要该布局时由菜单或祖先目录明确选择。未知页面 key、缺少组件名或未知菜单类型不会回退到任意导入；前两者记录控制台错误并跳过路由，未知类型抛出错误。

## 页面注册、布局与样式

`view-registry.ts` 通过两个 `import.meta.glob` 模式扫描 `@/modules/system/**/registerViews.ts` 与 `@/modules/biz/**/registerViews.ts`，自动发现两个分类下的登记模块。登记 key 必须符合小写字母开头的 kebab-case 约束且全局唯一；缺少 `registerViews()`、非法 key 或重复 key 会在注册表构建时失败。

`AppHeader` 在桌面和移动端统一使用 `72px` 高度，保留粘性定位、菜单按钮、标题路径和用户菜单交互；该高度减少应用壳的纵向占用，不改变主内容与侧栏的布局职责。

布局注册表通过懒加载发现 `src/layouts/*.vue`。`AdminLayout` 是静态根壳和必备布局；`EmptyLayout` 可供菜单显式选择。Tailwind CSS 负责布局、间距、响应式和多数视觉样式，Element Plus 提供表单、表格、弹窗和反馈；全局 SCSS 按基础、管理布局、过渡和 Element Plus 组件覆盖拆分。用户、角色、部门、菜单和字典管理页面共用的内容容器最大宽度为 `1920px`，窄于该宽度时仍保持响应式占满可用空间。

## 全局 HTTP 错误

共享 Client 只识别 HTTP `401`、`404`、`500` 并调用启动时注册的处理器：401 清状态并跳登录，404 跳错误页，500 使用安全消息提示。HTTP `200` 中的非零业务 `status` 由发起请求的模块处理。

## 验证与已知边界

- AI 执行格式、静态检查、TypeScript 检查和生产构建；不创建或运行前端自动化、端到端或浏览器测试。
- 维护者人工验收登录恢复、cookie 到期、退出/401 清理、直接访问动态 URL、页面与布局发现、目录嵌套、权限菜单过滤、部门与三类主体策略弹窗和响应式外壳。
- 当前构建会提示 `AdminLayout.vue` 和 `HomePage.vue` 同时被静态与动态导入，因此不会拆入独立动态 chunk；这不阻止生产构建。
- `useHealth` 成功重试时不会清理旧错误状态；系统化可访问性审计和生产环境 API 地址策略尚未补齐。

初始版本之前的前端应用壳和注册表取舍保留在[归档索引](../../archive/README.md)，当前行为以本设计和维护者实现为准。
