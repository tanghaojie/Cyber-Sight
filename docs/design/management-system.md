---
title: 管理系统基础能力设计
status: active
owner: maintainers
updated: 2026-07-22
---

# 管理系统基础能力设计

## 背景与目标

在现有 Vue 3、Fastify、OpenAPI 和 PostgreSQL 脚手架上提供可直接扩展的管理后台基线，包括现代化应用框架、用户登录退出、用户/角色/菜单/字典管理，以及全表统一的审计与软删除能力。

## 范围与非目标

本次包含管理端登录态、管理页面框架、空白首页、四类基础资料的查询与增删改、角色关联和菜单树展示。暂不实现租户、组织机构、细粒度按钮权限、注册、找回密码、文件上传和生产级单点登录。

## 职责与边界

- `packages/openapi-spec` 定义认证和管理 API 的稳定契约。
- `apps/backend/src/modules/auth` 负责凭据校验、会话创建/撤销与当前用户解析。
- `apps/backend/src/modules/admin` 负责管理资源用例；路由只处理 HTTP 映射，仓储隔离 Drizzle 查询。
- `apps/backend/src/db` 定义业务表、统一审计列和软删除过滤规则。
- `apps/frontend/src/layouts` 负责导航、顶栏和内容区框架；`modules/auth` 管理跨页面登录态；`views/admin` 负责资源页面交互。

## 公共接口

- 认证：`POST /auth/login`、`POST /auth/logout`、`GET /auth/me`。
- 用户：`GET/POST /admin/users`、`PUT/DELETE /admin/users/{id}`。
- 角色：`GET/POST /admin/roles`、`PUT/DELETE /admin/roles/{id}`。
- 菜单：`GET/POST /admin/menus`、`PUT/DELETE /admin/menus/{id}`。
- 字典：`GET/POST /admin/dictionaries`、`PUT/DELETE /admin/dictionaries/{id}`。

列表接口接受可选 `pageNum`、`pageSize` 和 `keyword`，继续遵守统一分页响应。删除接口只执行软删除。

## 数据模型与数据流

所有持久化业务表默认包含五个生命周期字段：`is_deleted`、`created_at`、`created_by`、`updated_at`、`updated_by`。用户需求中重复出现“更新时间”，本设计按常用审计语义将第五项解释为“更新人”。业务读取默认附加 `is_deleted = false`，删除操作更新软删除标志和更新审计信息，不执行物理删除。

核心表包括 `users`、`roles`、`user_roles`、`menus`、`role_menus`、`dictionaries` 和 `auth_sessions`。登录时使用 Node.js `scrypt` 校验密码；服务端生成不可预测会话令牌，只持久化令牌哈希，并通过 `HttpOnly`、`SameSite=Lax` Cookie 传递。退出时软删除当前会话。

## 依赖关系

继续使用现有 Fastify、Zod、Drizzle、PostgreSQL、Vue Router、Pinia 与 `openapi-fetch`。密码散列、随机令牌和摘要使用 Node.js 内置 `crypto`，不新增认证运行时依赖。前端视觉体系使用仓库内 CSS 设计令牌和组件，不引入 UI 框架。

## 失败模式与安全考虑

- 登录失败统一返回业务错误码，不泄露账号是否存在；密码与会话明文不写日志、不入库。
- 未认证访问管理 API 返回 HTTP 401；前端路由守卫跳转登录页。
- 用户名、角色编码、菜单编码和字典类型+键保持唯一；软删除后允许创建新记录时由应用层处理冲突。
- 删除当前登录用户、系统内置管理员角色或仍被引用的基础资料时返回业务冲突/禁止错误。
- 数据库不可用由现有全局错误策略转换为安全响应。

## 测试与验证策略

- 单元测试覆盖密码散列、会话令牌和软删除审计构造。
- Fastify 注入测试使用内存仓储覆盖登录、鉴权、分页、CRUD 与软删除不可见性。
- 前端组件测试覆盖登录成功/失败、路由保护和资源页面列表/空/错误状态。
- 契约生成、类型检查、Vitest、生产构建和 Drizzle 迁移生成全部通过。
- 启动本地前端进行登录页与管理框架的桌面/窄屏视觉检查。

## 兼容性与迁移

现有示例 `users` 表将演进为管理用户表，迁移新增基础管理表并写入初始管理员 `admin / Admin@123456`。初始密码仅用于本地首次登录，部署前必须通过环境或运维流程修改。旧健康检查继续保留。

## 未决问题

细粒度 RBAC 权限校验、初始密码安全注入和组织/租户模型留待后续需求；当前角色与菜单关系先形成可扩展数据结构，页面级鉴权只要求已登录。

## 相关 ADR、计划和 AI 日志

- [ADR-0005：统一软删除与审计字段](../decisions/ADR-0005-soft-delete-and-audit-fields.md)
- [实施计划](../plans/archive/2026-07-22-management-system-foundation.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-22-management-system-foundation.md)
