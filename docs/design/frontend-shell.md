---
title: 前端应用壳与动态页面设计
status: active
owner: maintainers
updated: 2026-07-27
---

# 前端应用壳与动态页面设计

## 背景与目标

管理端需要把导航、顶栏和内容承载区从具体业务页面中拆开，使新增页面只需声明路由和导航元数据即可进入统一框架。样式层采用 Tailwind CSS，通用交互组件采用 Element Plus，并在其上保留项目自己的视觉令牌和品牌表达。

## 职责与边界

- `src/layouts/AdminLayout.vue`：只负责应用壳编排、移动端侧栏状态和全局布局事件。
- `src/components/layout/AppSidebar.vue` 与 `SidebarTree.vue`：展示可配置品牌和数据库树形菜单；目录折叠、菜单交给 Vue Router、按钮安全打开外链。
- `src/components/layout/AppHeader.vue`：展示当前路由标题、折叠入口、用户信息和退出入口。
- `src/components/layout/AppMain.vue`：承载嵌套路由，通过 `RouterView` 动态加载页面并提供页面切换过渡。
- `src/modules/navigation`：当前用户数据库菜单树的前端缓存。
- `src/modules/**/view-registry.ts`：业务模块声明组件标识与页面懒加载器的注册函数。
- `src/router/view-registry.ts`：在构建期自动发现模块注册文件、校验组件标识唯一性并生成只读受控映射。
- `src/router/index.ts`：只静态声明登录、404 和应用壳；认证后根据菜单树注册业务子路由。
- `src/modules/<module>/pages`：模块拥有的页面组件，不负责应用壳和全局导航。

业务页面通过 Vue Router 的懒加载组件进入 `AppMain`。应用壳不根据菜单名称手写条件分支，也不持有业务页面状态。

## 样式与组件策略

Tailwind CSS 负责布局、间距、响应式、颜色和大多数视觉样式；少量难以表达的全局主题变量、过渡和 Element Plus 覆盖保留在 `src/styles/`。`main.scss` 只作为样式组合入口；基础令牌、管理页面和侧栏布局分别由独立 SCSS 文件拥有。Element Plus 全局变量放在 `element-plus/element-plus-global-override.scss`，按钮、输入、选择器、对话框、表单和表格覆盖分别放在对应的 `el-*-override.scss`，避免全局入口再次膨胀。Element Plus 提供按钮、输入、表格、分页、对话框、下拉菜单和反馈等通用交互能力，避免重复维护基础组件行为。

项目视觉采用“精密实验室”方向：深墨绿导航、低饱和冷灰绿画布、`#70CFA2` 薄荷主色和清晰的信息层级。Element Plus 主题变量映射到项目令牌，不依赖默认蓝色主题。

应用壳使用明确的语义类和单一响应式断点管理几何关系，避免组件模板中的独立定位工具类互相覆盖：

- 桌面端为 `280px minmax(0, 1fr)` 两列网格。侧栏属于第一列，在文档流内占据真实宽度，可在自身列内保持粘性；内容列不得再使用与侧栏宽度耦合的 `padding-left`。
- 内容列由顶栏和主内容区组成；顶栏在内容列顶部保持粘性并拥有独立层级，主内容区负责页面留白和横向溢出约束。
- 小于 `1024px` 时应用壳退化为单列，侧栏才切换为固定抽屉。抽屉默认关闭，通过顶栏菜单按钮打开，通过遮罩、关闭按钮或完成导航后关闭。
- 桌面侧栏可见性由媒体查询保证，不依赖移动抽屉的打开状态；视口跨断点变化时不得遮挡顶栏或主内容。

## 数据流与公共接口

1. 路由守卫恢复认证状态并调用导航 store 获取数据库菜单树。
2. Vite 在构建期发现各模块的 `view-registry.ts` 并调用其 `registerViews()`，路由组合根再把有效 `menu` 节点的 `component` 映射为模块懒加载器并注册子路由。
3. `AppSidebar` 递归渲染目录、站内菜单与外链按钮。
4. `AppHeader` 从动态路由元数据读取标题和说明，从认证 store 读取当前用户。
5. `AppMain` 使用嵌套 `RouterView` 异步加载目标页面；菜单树刷新时应用壳重建动态路由。

## 失败模式与兼容性

- 未注册组件不生成路由；未知地址在菜单路由安装后进入独立 404 页面。
- 空组件标识、重复组件标识或不符合约定的模块注册文件会在创建注册表时直接报错，避免后注册模块静默覆盖先注册模块。
- 未认证访问仍由现有路由守卫跳转登录页，不改变认证边界。
- 桌面端侧栏在网格内占位并保持粘性；窄屏使用默认关闭的遮罩抽屉，菜单点击后自动关闭。
- 动画遵守 `prefers-reduced-motion`，键盘操作保留可见焦点。

## 测试策略

- 组件测试验证侧栏菜单渲染、标题映射、动态路由出口和移动端事件。
- 注册表测试验证模块注册文件可被自动发现、重复组件标识被拒绝；路由测试验证已注册组件可加载、未知组件被拒绝、深层地址在菜单加载后重新匹配。
- 运行前端 Vitest、TypeScript 检查和 Vite 生产构建。
- 使用本地浏览器检查桌面与窄屏布局、菜单切换和页面过渡。

## 相关决策与计划

- [ADR-0008：前端采用 Tailwind CSS 与 Element Plus](../decisions/ADR-0008-tailwind-and-element-plus.md)
- [实施计划](../plans/archive/2026-07-23-frontend-shell-componentization.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-23-frontend-shell-componentization.md)
- [前端应用壳流式布局重构计划](../plans/archive/2026-07-27-frontend-layout-refactor.md)
- [前端应用壳流式布局重构协作记录](../ai-logs/2026/07/2026-07-27-frontend-layout-refactor.md)
