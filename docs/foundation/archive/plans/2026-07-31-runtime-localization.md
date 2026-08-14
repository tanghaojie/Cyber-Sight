---
title: 实现前端运行时中英文切换
status: completed
created: 2026-07-31
updated: 2026-07-31
---

# 实现前端运行时中英文切换

## 目标

在不修改数据库、后端和 API 契约的前提下，实现默认中文、可切换英文的运行时前端界面，并把
语言能力作为独立 `localization` 系统模块交付。

## 背景与设计依据

现有 Vue 应用的固定文案、默认菜单、路由标题、Element Plus 和日期格式绑定中文。实现遵循
[前端运行时多语言模块](../../design/modules/localization.md)和
[ADR-0029](../../decisions/ADR-0029-frontend-runtime-localization.md)。

## 范围

- 新增 localization 模块、模块化资源注册和浏览器语言持久化。
- 翻译运行时固定界面、默认导航、代码目录、日期和前端提示。
- 在登录页和 Header 增加符合 CYBER 视觉的语言切换器。
- 让路由、面包屑和 tag view 响应语言变化。
- 更新现行设计和模块索引。

## 非目标

- README、文档、源码注释、Swagger 和后端响应本地化。
- 数据库、迁移、后端或共享契约变更。
- 翻译用户录入的菜单、部门、角色、字典和业务数据。
- 前端自动化或浏览器测试。

## 前置条件和风险

- 开始修改前暂存区必须为空；已于 2026-07-31 通过门禁。
- 新增 Vue I18n 依赖需要更新 workspace lockfile。
- 默认菜单只能通过严格指纹识别；匹配规则过宽会覆盖用户数据。
- 当前页面数量较多，遗漏固定文案会造成中英混用。

## 实施任务

- [x] 创建 localization 模块、资源类型、Vue 插件、Provider 和持久化。
- [x] 建立各模块中英文资源并迁移固定用户可见文案。
- [x] 接入 Element Plus、日期格式、HTML 语言和浏览器标题。
- [x] 实现默认导航指纹、本地化路由标签、面包屑和 tag view 显示。
- [x] 在登录页和应用 Header 接入语言切换器。
- [x] 本地化前端已知错误与成功提示，保留未知错误安全兜底。
- [x] 更新设计、索引和协作记录。
- [x] 执行格式、Lint、TypeScript 和生产构建验证。
- [x] 归档完成计划和 AI 协作记录并创建带 AI trailer 的提交。

## 测试与验证

- `pnpm format`
- `pnpm lint`
- `pnpm format:check`
- `pnpm build`
- 搜索运行时源码中剩余中文，逐项确认其为注释、用户数据兜底或明确非运行时内容。
- 前端浏览器行为由维护者按 localization 设计中的人工验收清单确认。

## 发布与回滚

本次只影响前端依赖和静态资源。回滚提交即可恢复单语言界面；新语言存储键无敏感信息，旧代码
会忽略它。数据库和 API 无需回滚。

## 实际偏差和遗留问题

- 原计划的未知服务端 `err` 诊断兜底没有直接显示在界面；为避免中英混用和泄露内部信息，
  已知交互统一使用当前场景的安全本地化提示，服务端契约仍保持不变。
- 没有增加前端自动化或浏览器测试，符合仓库验证边界；语言切换、持久化、响应式布局和
  自定义菜单名称原样显示仍需维护者人工验收。
- 生产构建保留既有的 Sass legacy API、VueUse PURE 注释，以及 `AdminLayout`、`HomePage`
  静态和动态重复导入警告；均未阻止构建，与本次本地化实现无新增失败。

## 实际验证结果

- `pnpm format`：通过。
- `pnpm lint`：通过。
- `pnpm format:check`：通过。
- `pnpm build`：通过；包含 API 契约、后端 TypeScript、前端 `vue-tsc` 和 Vite 生产构建。
- 运行时源码中文检索：剩余项为源码注释、品牌专名、静态路由与初始菜单的中文回退值、
  默认菜单严格指纹及开发期注册错误，不是遗漏的固定单语界面。
- 前端人工功能验收：未执行，由维护者按 localization 设计清单完成。

## 相关设计、ADR 和 AI 日志

- [前端运行时多语言模块](../../design/modules/localization.md)
- [ADR-0029](../../decisions/ADR-0029-frontend-runtime-localization.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-31-runtime-localization.md)
