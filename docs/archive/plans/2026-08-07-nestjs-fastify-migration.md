---
title: NestJS 与 Fastify adapter 后端迁移
status: completed
created: 2026-08-07
updated: 2026-08-07
---

# NestJS 与 Fastify adapter 后端迁移

## 目标

将后端从直接使用 Fastify 4 的路由与插件组合迁移到 NestJS 11，同时继续使用 Fastify 5 adapter，保持现有 API 路径、响应语义、认证授权、审计日志、Drizzle 数据访问和共享 Zod 契约。

## 背景与设计依据

原后端已经具备共享 Zod 契约、可插拔授权、JWT 会话和审计日志，但横切能力依赖 Fastify 插件、实例装饰和路由封装域。随着系统模块增加，需要使用 Nest Module、Controller 和依赖注入统一应用生命周期。设计依据为[后端模块设计](../../design/modules/backend.md)、[API 契约模块设计](../../design/modules/api-contract.md)和 [ADR-0032](../../decisions/ADR-0032-nestjs-fastify-adapter.md)。

## 范围

- 引入 NestJS 11、Nest Swagger、Fastify 5 adapter 和必要运行时依赖。
- 将健康检查、认证、授权、接口日志、用户、角色、部门、菜单和字典路由迁移为 Nest Module/Controller。
- 使用全局 Guard、Filter、Interceptor 和 Zod Pipe 替代原 Fastify 授权插件、错误处理和路由 Schema 链路。
- 保留 Fastify adapter 生命周期 hooks 采集接口日志。
- 让业务服务和仓储依赖 `BackendRuntime`，不再把 Fastify 实例作为服务容器。
- 更新共享契约、测试、现行设计、维护指南、项目说明和关于页技术栈文案。

## 非目标

- 不修改业务 API 路径、数据库 Schema、迁移文件、权限键、JWT 格式或审计保留期。
- 不引入 Fastify Zod Type Provider 作为 Nest Controller 主链路。
- 不创建前端自动化或浏览器测试；前端关于页文案由维护者人工验收。

## 前置条件和风险

- Fastify 4 升级到 Fastify 5，Nest Swagger 需要显式安装兼容的 `@fastify/static` peer dependency。
- Nest Guard 先于参数 Pipe 执行，受保护接口仍以认证和授权为第一边界。
- 生产入口必须在 Nest 关闭生命周期中停止审计写入器并关闭 PostgreSQL 客户端。

## 实施任务

- [x] 建立 Nest 应用组合根、Runtime Module 和全局横切能力。
- [x] 迁移全部系统模块的 HTTP 路由并删除旧 Fastify route/plugin 文件。
- [x] 继续使用共享 Zod Schema 约束输入、输出与 Swagger。
- [x] 迁移 Fastify adapter 审计 hooks 和测试注入边界。
- [x] 更新依赖、契约、现行设计、ADR、维护指南和前端技术栈文案。
- [x] 执行格式、Lint、构建、测试、文档审计和只读数据库检查。
- [x] 归档完成计划与 AI 协作记录，并创建带真实模型 trailer 的 Git 提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm build`
- `pnpm test`：后端 14 个测试文件、116 项测试通过。
- `pnpm docs:archive:check`：`NOT_DUE`。
- `pnpm test:db`：PostgreSQL 连接、`sys_users` 和 Drizzle 迁移表检查通过。
- `git diff --check`

## 发布与回滚

发布继续使用现有环境变量和启动命令。若需回滚，恢复本次提交并重新安装 lockfile 中的 Fastify 4 依赖；数据库和迁移文件无需回滚。

## 实际偏差和遗留问题

- 原计划保留 Fastify adapter，实施中确认 Nest Swagger 在该 adapter 下需要 `@fastify/static`，已显式加入依赖。
- 共享分页和路径数字 Schema 改用显式 coercion，以适配 Nest 接收到的 HTTP 字符串参数。
- 前端关于页技术栈文案已更新，浏览器视觉效果仍由维护者人工验收。

关联提交：`refactor(backend)!: migrate to NestJS`

## 相关设计、ADR 和 AI 日志

- [后端模块设计](../../design/modules/backend.md)
- [API 契约模块设计](../../design/modules/api-contract.md)
- [ADR-0032：NestJS 与 Fastify adapter 后端基线](../../decisions/ADR-0032-nestjs-fastify-adapter.md)
- [AI 协作记录](../../ai-logs/2026/08/2026-08-07-nestjs-fastify-migration.md)
