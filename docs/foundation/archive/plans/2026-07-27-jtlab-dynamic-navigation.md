---
title: JTLab 品牌、动态导航与前端模块拆分
status: completed
created: 2026-07-27
updated: 2026-07-27
---

# JTLab 品牌、动态导航与前端模块拆分

## 目标

把项目品牌统一为可配置的 JTLab，以 `#70CFA2` 建立全局绿色主题；用数据库菜单树驱动当前用户的导航、动态路由和页面懒加载；拆分四个基础资料前端模块；完成 401/404/500 的真实应用行为。

## 背景与设计依据

任务开始时存在 NOVA 硬编码、紫色遗留样式、静态 `navigation.ts`、静态业务路由、聚合 `ResourceView.vue` 和只广播事件的全局错误占位。实现依据 `dynamic-navigation-and-branding.md`、ADR-0010、ADR-0011、ADR-0004、ADR-0008 和 ADR-0009。

## 范围

- 品牌配置、README、文档标题和 Swagger 品牌更新。
- 全局 CSS/Element Plus 主题与登录、应用壳、首页、404 页视觉更新。
- 菜单 Schema/数据库迁移、导航树接口、动态路由和树形侧栏。
- 用户、角色、菜单、字典独立前后端与契约模块。
- 401 清会话跳登录、404 跳错误页、500 ElMessage 提示。
- 契约、后端和前端测试以及完整构建、浏览器视觉验证。

## 非目标

- 不实现远程任意组件、低代码页面生成、按钮级后端授权和实时菜单推送。
- 不改变现有业务 URL 和统一 HTTP/业务错误码协议。

## 前置条件和风险

- 动态菜单依赖数据库迁移和现有角色关联，迁移为超级管理员补齐目录授权。
- 路由首次匹配发生在菜单树加载前，实现通过“先装载动态路由、再重新匹配”避免 catch-all 抢占。
- 工作区开始时干净，实施期间没有发现无法确认归属的外部改动。

## 实施任务

- [x] 审计现有设计、数据模型、路由、页面与测试。
- [x] 建立设计、ADR、模块文档、计划和 AI 日志。
- [x] 更新共享菜单契约、数据库 Schema/迁移和导航树后端接口。
- [x] 建立前端品牌配置、主题令牌和全局错误处理器。
- [x] 建立导航 store、受控页面注册表、动态路由和树形侧栏。
- [x] 拆分用户、角色、菜单和字典独立模块并删除聚合实现。
- [x] 新增 404 页面，更新登录、首页和应用壳视觉。
- [x] 补齐测试并执行全仓测试、类型检查和生产构建。
- [x] 同步最终设计与验证结果，归档计划并提交。

## 测试与验证

- `pnpm test`：通过；契约 TypeScript 检查、后端 39 项测试、前端 22 项测试全部成功。
- `pnpm build`：通过；契约、Fastify 后端和 Vue/Vite 前端生产构建全部成功。
- `git diff --check`：通过。
- 浏览器桌面检查：JTLab 登录页和 404 页面布局、文案、主色正常，控制台无 warning/error。
- 浏览器 390 × 844 检查：登录页单栏布局、输入框和主按钮正常。
- 计算样式确认 Element Plus 主按钮背景为 `rgb(112, 207, 162)`。
- Drizzle 已生成 `0002_dark_cobalt_man.sql` 与快照；未在任务中擅自迁移维护者的本地数据库。

## 发布与回滚

先执行 `pnpm db:migrate`，再部署后端和前端。回滚代码时可暂时保留新增的 `component`、`external_url` 列；若回滚数据库，需要另行审查目录和角色关联数据恢复方案。

## 实际偏差和遗留问题

- 原计划主要强调前端解耦；为满足仓库模块边界，最终同步拆分了后端路由/仓储和 API 契约模块。
- 菜单管理新增 `GET /admin/menus/tree` 全量树接口，避免使用分页数据构树导致父子节点跨页丢失。
- Element Plus 按需 CSS 的加载顺序会覆盖普通 `:root` 变量，最终使用更高优先级的 `html:root` 和主按钮规则稳定主题。
- Vite 构建仍会输出第三方 `@vueuse/core` PURE 注释位置的非阻塞警告；产物正常生成。
- 未执行真实数据库迁移和认证后浏览器 CRUD；数据库行为由迁移审查、类型构建和仓储/树构造单元测试覆盖，部署前需按环境执行迁移。

## 相关设计、ADR 和 AI 日志

- `docs/archive/design/dynamic-navigation-and-branding.md`
- `docs/decisions/ADR-0010-database-navigation-and-controlled-view-registry.md`
- `docs/decisions/ADR-0011-registered-application-http-error-handler.md`
- `docs/archive/ai-logs/2026/07/2026-07-27-jtlab-dynamic-navigation.md`
- 提交主题：`feat: add JTLab dynamic navigation and modular admin pages`
