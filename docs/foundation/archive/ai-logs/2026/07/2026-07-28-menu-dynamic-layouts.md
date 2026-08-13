---
title: 菜单动态布局
date: 2026-07-28
status: completed
---

# 菜单动态布局

## 用户目标和约束

前端目录与菜单新增布局选择，选项自动读取 `apps/frontend/src/layouts/` 中全部 `.vue` 文件，数据库菜单生成的动态路由自动使用所选布局。

## 关键问答与确认

用户未指定空布局、目录与菜单冲突时的规则；按兼容且可组合的语义实施。

## AI 的重要假设

- 空布局继承最近目录布局，根节点空布局回退 `AdminLayout`。
- 菜单非空布局覆盖目录布局；未知非空布局拒绝注册路由。
- 工作区既有 `SidebarTree.vue` 修改属于用户，完整保留。

## 方案和执行摘要

已更新共享契约、菜单数据库字段、迁移与仓储映射；新增构建期布局注册表并直接生成菜单表单选项；动态路由以布局为父路由、页面为默认子路由，支持目录继承、菜单覆盖和 `AdminLayout` 默认回退。菜单契约的存量模块入口同步迁移为表意文件。frontend-design 技能检查确认新增控件沿用现有 Element Plus 管理端语言。

全量测试另发现健康检查未执行挂载时首次请求，已最小修复，并在侧栏组件测试中显式 mock 健康状态以隔离网络。

## 验证结果

- `@scaffold/api-contract` 构建通过。
- 后端构建通过，7 个测试文件共 53 项通过。
- 前端生产构建通过，11 个测试文件共 33 项通过。
- Drizzle 生成 `0005_pretty_wallow.sql`，以默认空字符串新增非空 `menus.layout`。
- `git diff --check` 通过。

## 未决问题与下一步

无。工作区中任务开始前已有的 `SidebarTree.vue` 排版修改未纳入本任务提交。

## 相关设计、ADR、计划和提交

- `docs/design/frontend-shell.md`
- `docs/decisions/ADR-0017-database-selected-layout-registry.md`
- `docs/archive/plans/2026-07-28-menu-dynamic-layouts.md`
- 提交：`feat: support menu-selected layouts`（本轮自动提交）
