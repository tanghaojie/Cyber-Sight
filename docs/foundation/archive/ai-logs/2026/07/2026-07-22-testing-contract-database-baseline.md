---
title: 测试、接口契约与 PostgreSQL 基线
date: 2026-07-22
status: completed
---

# 测试、接口契约与 PostgreSQL 基线

## 用户目标和约束

- 检查并删除无用的 `sensible.ts`。
- 添加项目测试模块并安装全部依赖。
- 统一前后端接口层类型定义。
- 使用用户本机已安装的 PostgreSQL 开发数据库完成配置。
- 用户明确允许调度多个子智能体并行工作。

## 重要安全边界

- 用户提供了本地开发数据库凭据；凭据只写入 Git 忽略的 `.env`，不进入本日志、设计、计划或提交内容。
- 使用用户指定的现有数据库，不擅自创建其他数据库。
- 执行迁移前先检查已有对象，不自动删除数据库对象。

## 方案

- 并行处理无用文件审查、测试骨架和共享接口类型。
- 使用共享 OpenAPI 生成类型包消除前后端编译期类型分叉。
- 使用契约测试约束 OpenAPI 和 Fastify Swagger 的一致性。
- 默认测试保持快速且不依赖真实 PostgreSQL，数据库验证通过独立命令运行。

## 执行与验证结果

- 子智能体确认 `sensible.ts` 无引用且不会被自动加载，文件已删除。
- 后端拆分为可测试的 `buildApp` 和独立 `server.ts`，数据库客户端在应用关闭时释放。
- OpenAPI 类型生成到 `@scaffold/openapi-spec`，前端 API Client 和后端 health 路由共同消费。
- 后端增加路由和 OpenAPI/Swagger 契约测试，2 个测试通过。
- 前端增加 HomeView loading、success、error 和 refresh 测试，4 个测试通过。
- 用户协助完成依赖安装；锁文件和 pnpm 构建脚本许可已更新。
- 本地环境变量完成配置，敏感凭据仅存在于 Git 忽略文件。
- PostgreSQL 18.4 连接成功，Drizzle 首次迁移已应用，`public.users` 和迁移记录表存在。
- 前端 TypeScript 配置增加 `noEmit`，避免 `vue-tsc` 将 JavaScript 发射到源码目录。
- `pnpm gen:api`、`pnpm test`、`pnpm build`、`pnpm test:db` 均通过。

## 未决问题

运行时 Fastify Schema 是否完全由 OpenAPI 自动生成，留待接口复杂度增加后复审。

## 后续工作约定

用户要求后续每轮工作在验证通过后直接创建 Git 提交。该约定已同步到根 `AGENTS.md` 和文档治理设计。
