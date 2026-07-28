---
title: JTLab 品牌、动态导航与前端模块拆分
date: 2026-07-27
status: completed
---

# JTLab 品牌、动态导航与前端模块拆分

## 用户目标和约束

用户要求把 NOVA 改为可配置的 JTLab，以 `#70CFA2` 统一绿色高级主题；数据库菜单动态驱动树形导航、路由和页面组件；拆开用户、角色、菜单、字典四个前端模块；把 HTTP 401/404/500 占位事件替换为真实应用行为。

仓库规则要求非简单改动先写设计、计划和 AI 日志，实质修改模块必须遵守独立目录和公共入口，并在完整验证后提交。

## 关键问答与确认

无需额外用户确认即可保留现有 `/users`、`/roles`、`/menus`、`/dictionaries` 路径。JTLab 解释为“桀士实验室”的简洁英文品牌标识。

## AI 的重要假设

- “动态加载 views 组件”指数据库选择构建时已注册的 Vue 页面，而不是从数据库执行任意脚本。
- “按钮跳转外链”使用显式 `externalUrl`，只接受 `http/https`，新窗口安全打开。
- 配置文件提供 JTLab 默认值，并允许通过环境变量覆盖，以兼顾模板修改和不同部署环境。
- 主题采用克制的精密实验室视觉，而非大面积高饱和绿色。

## 方案和执行摘要

完成数据库 `component`/`externalUrl`、当前用户菜单树和管理全量树接口；前端导航 store、受控组件注册表和动态子路由已接入。四个 CRUD 页面、后端路由/仓储和契约分别进入独立模块，原 `admin`、静态导航和 `ResourceView` 已删除。全局错误由应用处理器执行，JTLab 配置与 `#70CFA2` 主题覆盖登录、应用壳、首页和 404 页面。

## 验证结果

- `pnpm test` 通过：后端 39 项、前端 22 项，契约类型测试通过。
- `pnpm build` 通过：三个 workspace 均成功生成产物。
- Drizzle 迁移 `0002_dark_cobalt_man.sql` 和快照已生成。
- 浏览器检查桌面登录、390 × 844 登录和 404 页面均正常；无控制台 warning/error；主按钮计算色为 `rgb(112, 207, 162)`。
- `git diff --check` 通过。

## 未决问题与下一步

部署环境需先执行 `pnpm db:migrate`。本轮未擅自改动维护者本地数据库，也未进行依赖真实数据库的认证后浏览器 CRUD；相关代码由类型、构建和单元测试验证。Vite 仍输出第三方 PURE 注释位置的非阻塞警告。

## 相关设计、ADR、计划和提交

- `docs/archive/design/dynamic-navigation-and-branding.md`
- `docs/decisions/ADR-0010-database-navigation-and-controlled-view-registry.md`
- `docs/archive/plans/2026-07-27-jtlab-dynamic-navigation.md`
- `docs/decisions/ADR-0011-registered-applicationHttpError-handler.md`
- 提交主题：`feat: add JTLab dynamic navigation and modular admin pages`
