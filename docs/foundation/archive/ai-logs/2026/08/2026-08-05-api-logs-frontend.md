---
title: 接口日志前端与运维导航
date: 2026-08-05
status: completed
---

# 接口日志前端与运维导航

## 用户目标和约束

实现昨日完成的接口日志后端能力的前端展示。功能、数据权限和菜单必须由数据库迁移自动添加；
接口日志不放入“系统配置”，而是在新建的“运维监控”目录中展示。

## 关键问答与确认

- 采用只读审计工作台：筛选、分页表格和元数据详情抽屉。
- 不增加后端尚未提供的聚合统计、自动轮询、导出或删除能力。

## AI 的重要假设

- “数据权限”指菜单的 `required_permission_key` 和超级管理员的既有角色授权模型；接口日志没有
  组织或行级数据范围规则。
- 新目录路径使用 `/ops`，接口日志使用相对路径 `api-logs`，并继承 `AdminLayout`。

## 方案和执行摘要

已新增前端 `system/api-logs` 模块、双语资源、动态页面注册、筛选分页表格和详情抽屉。迁移
`0002_api_log_operations_menu` 自动确保 `api_logs.read` 权限、`/ops` 的“运维监控”目录、
`api-logs` 子页面及超级管理员的功能权限和兼容菜单关联存在；导航指纹与权限目录同步支持新项
的中英文名称。

## 验证结果

通过 `pnpm format`、`pnpm lint`、`npx vue-tsc --noEmit`、`pnpm build` 和
`pnpm --filter @scaffold/backend test`（13 个文件、110 项测试）。生产构建仅报告既有 Sass
legacy API、Rollup PURE 注释及静态/动态导入提示。

## 未决问题与下一步

无阻塞。维护者需要在部署后按前端人工验收边界确认筛选、详情抽屉、菜单权限和窄屏行为。

## 相关设计、ADR、计划和提交

- `docs/design/modules/api-logs.md`
- `docs/design/modules/menus.md`
- `docs/archive/plans/2026-08-05-api-logs-frontend.md`
