---
title: 前端应用壳与动态页面设计
status: active
owner: maintainers
updated: 2026-07-23
---

# 前端应用壳与动态页面设计

## 背景与目标

管理端需要把导航、顶栏和内容承载区从具体业务页面中拆开，使新增页面只需声明路由和导航元数据即可进入统一框架。样式层采用 Tailwind CSS，通用交互组件采用 Element Plus，并在其上保留项目自己的视觉令牌和品牌表达。

## 职责与边界

- `src/layouts/AdminLayout.vue`：只负责应用壳编排、移动端侧栏状态和全局布局事件。
- `src/components/layout/AppSidebar.vue`：展示品牌、分组菜单、当前路由状态和运行环境信息；菜单点击交由 Vue Router。
- `src/components/layout/AppHeader.vue`：展示当前路由标题、折叠入口、用户信息和退出入口。
- `src/components/layout/AppMain.vue`：承载嵌套路由，通过 `RouterView` 动态加载页面并提供页面切换过渡。
- `src/router/navigation.ts`：导航展示模型的单一来源；路由仍在 `src/router/index.ts` 中声明。
- `src/views/`：页面级组件，不负责应用壳和全局导航。

业务页面通过 Vue Router 的懒加载组件进入 `AppMain`。应用壳不根据菜单名称手写条件分支，也不持有业务页面状态。

## 样式与组件策略

Tailwind CSS 负责布局、间距、响应式、颜色和大多数视觉样式；少量难以表达的全局主题变量、过渡和 Element Plus 覆盖保留在 `src/styles/main.css`。Element Plus 提供按钮、输入、表格、分页、对话框、下拉菜单和反馈等通用交互能力，避免重复维护基础组件行为。

项目视觉采用“精密工作台”方向：深墨绿色导航、暖灰色内容画布、荧光黄绿色状态强调和清晰的信息层级。Element Plus 主题变量必须映射到项目令牌，不能直接依赖默认紫蓝主题。

## 数据流与公共接口

1. `navigation.ts` 导出只读菜单分组和菜单项。
2. `AppSidebar` 接收菜单模型和展开状态，点击链接后由 Vue Router 更新当前路由。
3. `AppHeader` 从当前路由元数据读取标题和说明，从认证 store 读取当前用户。
4. `AppMain` 使用嵌套 `RouterView` 和路由路径作为过渡键，异步加载目标页面。
5. `AdminLayout` 响应子组件事件，负责开关移动端抽屉和调用退出流程。

## 失败模式与兼容性

- 异步页面加载失败由 Vue Router 保持当前导航状态，后续可接入独立的全局错误页。
- 未认证访问仍由现有路由守卫跳转登录页，不改变认证边界。
- 桌面端保持固定导航；窄屏使用遮罩抽屉，菜单点击后自动关闭。
- 动画遵守 `prefers-reduced-motion`，键盘操作保留可见焦点。

## 测试策略

- 组件测试验证侧栏菜单渲染、标题映射、动态路由出口和移动端事件。
- 路由测试验证菜单目标与子路由一致，业务页面测试继续隔离网络。
- 运行前端 Vitest、TypeScript 检查和 Vite 生产构建。
- 使用本地浏览器检查桌面与窄屏布局、菜单切换和页面过渡。

## 相关决策与计划

- [ADR-0008：前端采用 Tailwind CSS 与 Element Plus](../decisions/ADR-0008-tailwind-and-element-plus.md)
- [实施计划](../plans/archive/2026-07-23-frontend-shell-componentization.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-23-frontend-shell-componentization.md)
