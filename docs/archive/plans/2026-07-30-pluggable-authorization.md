---
title: 可插拔授权与部门实施计划
status: completed
created: 2026-07-30
updated: 2026-07-30
---

# 可插拔授权与部门实施计划

## 目标

交付可插拔的功能权限与数据权限模块，新增部门组织能力，重构用户、角色、菜单和认证边界，并让现有管理接口由后端强制授权。

## 背景与设计依据

用户确认采用 [ADR-0025](../../decisions/ADR-0025-pluggable-authorization-and-data-scope.md) 和授权/部门模块设计中的默认决策。

## 范围

- 权限、角色权限、部门、部门闭包、用户部门和数据策略 Schema/迁移。
- 共享 Zod 契约和 Fastify 授权门禁。
- 用户数据范围在列表、count、创建、更新和删除中的统一应用。
- 部门管理页面；用户部门与直接策略；角色权限与策略；部门继承策略。
- 菜单权限键和按有效权限生成导航。
- 后端自动化、格式、类型检查和生产构建。

## 非目标

Cerbos 实际部署、deny、角色继承、租户、字段权限、RLS、通用业务 ACL 和前端自动化测试。

## 前置条件和风险

- 任务开始时暂存区和工作区已确认干净。
- 迁移必须先为超级管理员回填完整权限和数据范围。
- 前端由维护者人工验收，AI 的构建不替代行为验收。
- 若数据库集成环境不可用，只执行迁移静态测试并明确记录。

## 实施任务

- [x] 固化设计、ADR、计划和 AI 协作记录。
- [x] 扩展契约和数据库模型并生成迁移。
- [x] 实现部门模块和用户部门归属。
- [x] 实现本地授权 Provider、路由声明门禁和管理 API。
- [x] 把用户、角色、菜单、字典管理接入功能权限。
- [x] 把用户资源接入数据范围。
- [x] 实现部门、用户、角色和菜单前端管理改造。
- [x] 补充后端测试并完成全量验证。
- [x] 同步最终设计、验证和偏差，归档计划与日志并提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- 数据库环境允许时执行 `pnpm test:db`
- 前端部门树、用户部门、三类主体策略、菜单可见性和直接 API 拒绝由维护者人工验收。

## 发布与回滚

单次迁移先创建表和种子，再启用代码门禁。回滚代码时保留新增表和 `role_menus` 兼容数据；数据库向下迁移需要单独备份并由维护者执行，不自动删除授权数据。

## 实际偏差和遗留问题

- `AuthorizationProvider` 通过 `buildApp()` 依赖注入，当前只交付本地 PostgreSQL Provider；Cerbos 适配器仍是可选后续工作。
- 用户、角色和部门定义与授权配置使用连续两次 API 保存，不是跨模块数据库事务；第二步失败时前端明确提示主体已保存但授权未完成。
- 迁移通过 Schema/SQL 静态测试，数据库连接检查成功，但本轮没有自动修改维护者的本地数据库；部署或本地使用前仍需执行 `pnpm db:migrate`。
- 前端遵循仓库边界，仅完成 TypeScript 和生产构建，交互行为由维护者人工验收。

## 实际验证结果

- `pnpm format`：通过。
- `pnpm format:check`：通过。
- `pnpm lint`：通过。
- `pnpm test`：通过，后端 11 个测试文件、86 项测试全部通过。
- `pnpm build`：契约、后端和前端生产构建通过；仅保留既有 Sass API 与静态/动态重复导入警告。
- `pnpm test:db`：PostgreSQL 18.4 连接成功，`users` 和 Drizzle 迁移表存在。

## 相关设计、ADR 和 AI 日志

- [授权设计](../../design/modules/authorization.md)
- [部门设计](../../design/modules/departments.md)
- [ADR-0025](../../decisions/ADR-0025-pluggable-authorization-and-data-scope.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-30-pluggable-authorization.md)
