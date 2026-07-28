---
title: 前端应用壳
status: accepted
owner: project maintainers
updated: 2026-07-28
---

# 前端应用壳

## 职责

前端应用壳统一承载 JTLab 品牌、响应式布局、数据库导航和业务页面出口，不拥有业务页面状态。

- `src/config/app.config.ts`：品牌名、说明和主色配置。
- `src/layouts/AdminLayout.vue`：应用壳编排与移动抽屉状态。
- `src/components/layout/`：侧栏、顶栏和嵌套路由出口。
- `src/modules/navigation/navigation.store.ts`：当前用户菜单树缓存。
- `src/modules/**/view-registry.ts`：业务模块登记页面懒加载器。
- `src/router/view-registry.ts`：构建期自动发现、唯一性校验和只读注册表。
- `src/shared/routing/layout-registry.ts`：构建期发现 `src/layouts/*.vue`，生成受控布局注册表和菜单表单选项。
- `src/assets/icons/*.svg`：独立 SVG 图标源；Vite 在构建期生成 sprite 和图标名称清单。
- `src/shared/icons/icon-registry.ts`：把构建期图标名称转为只读名称和菜单表单选项。
- `src/components/AppIcon.vue`：通过 SVG sprite 的 `<use>` 节点按稳定名称渲染图标。
- `src/router/index.ts`：静态登录、404、默认应用壳，以及认证后动态布局与页面路由组装。

页面通过模块注册文件进入 `RouterView`。应用壳不能按菜单名称写业务分支，数据库组件标识不能成为任意动态 import 路径。

## 导航与路由数据流

1. 路由守卫恢复会话并请求 `GET /navigation/menus`。
2. 后端按角色授权生成启用、未删除的菜单树并补齐祖先目录。
3. 构建期注册表把稳定组件标识映射到源码懒加载器。
4. 运行时递归解析路径和布局：相对路径拼接最近目录路径，以 `/` 开头的路径覆盖上级前缀；节点显式 `layout` 优先，否则继承最近的目录布局，最终回退到 `AdminLayout`。
5. 只为完整路径、布局和页面标识都能解析的 `menu` 节点注册路由；`directory` 传递路径与布局上下文但不生成可点击路由，`button` 只打开 HTTP(S) 外链。
6. 菜单刷新或 401 清会话时移除动态路由并清空导航状态。

未知或空组件标识、未知显式布局标识、无法解析为绝对地址的菜单路径不生成路由；空布局用于兼容旧数据并按继承/默认规则解析。存量空目录路径作为透明前缀兼容，新的目录写入必须提供路径。无效旧菜单仍可在管理页面修正，但不能进入执行导航。首次直接访问动态 URL 时，启动兜底路由在菜单加载后重新匹配，仍未知才进入 404。

## 布局与样式

桌面端使用 `280px minmax(0, 1fr)` 两列网格，侧栏在文档流内占位；内容列包含粘性顶栏和主内容。小于 `1024px` 时切换为单列和默认关闭的固定抽屉，可由顶栏、遮罩或导航动作关闭。

Tailwind CSS 负责布局、间距、响应式和多数视觉样式；Element Plus 提供表单、表格、弹窗和反馈。`src/styles/main.scss` 只组合基础令牌、管理样式、过渡及按组件拆分的 Element Plus SCSS 覆盖。动画遵守 `prefers-reduced-motion`，键盘焦点保持可见。

## 全局 HTTP 错误

共享 Client 只识别 HTTP 401/404/500，并调用应用启动时注入的处理器：401 清状态并跳登录，404 跳错误页，500 显示安全消息。HTTP 200 中的非零业务 `status` 由发起请求的模块处理。

## 验证

- AI 通过前端类型检查和生产构建验证页面、布局、路由及资源引用可以解析。
- 维护者人工验收页面与布局发现、未知组件/布局拒绝、路径继承/覆盖、直接地址、导航刷新、
  404、认证清理和三种菜单节点行为。
- 桌面布局、移动抽屉、侧栏对比度和 Element Plus 视觉覆盖由维护者在浏览器中人工检查；
  AI 默认不运行浏览器测试。

相关长期决策：[ADR-0008](../decisions/ADR-0008-tailwind-and-element-plus.md)、[ADR-0010](../decisions/ADR-0010-database-navigation-and-controlled-view-registry.md)、[ADR-0011](../decisions/ADR-0011-registered-application-http-error-handler.md)、[ADR-0012](../decisions/ADR-0012-module-view-registration-and-scss-layering.md)、[ADR-0018](../decisions/ADR-0018-vite-svg-icon-registry.md)、[ADR-0022](../decisions/ADR-0022-maintainer-owned-frontend-validation.md)。
