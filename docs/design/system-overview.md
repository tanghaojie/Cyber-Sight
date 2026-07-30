---
title: 系统概览
status: accepted
owner: project maintainers
updated: 2026-07-30
---

# 系统概览

JTLab（桀士实验室）是用于快速生成管理类业务模块的 pnpm 全栈脚手架，不是某个具体业务系统。它通过运行时契约、模块边界、后端与契约自动化测试、前端人工验收边界和文档门禁，让人和 AI 在明确约束内持续扩展。

## 初始版本基线

维护者提交 `f10f584` 及其父提交构成 2026-07-29 初始版本的逻辑基线。当前实现、共享契约和测试描述系统怎样工作；现行设计补充边界、数据流、失败模式和验证策略。人类修改优先于 AI 推断和历史文档，冲突处理遵循根目录 `AGENTS.md` 与 [ADR-0024](../decisions/ADR-0024-human-authored-state-authority.md)。

## 当前组成

```text
Vue 3 frontend
    -> inferred TypeScript types
Zod 4 runtime contract
    -> Draft 7 JSON Schema
Fastify 4 + Swagger + Drizzle
    -> PostgreSQL
```

- `apps/frontend`：Vue Router、Pinia、Tailwind CSS、Element Plus 和响应式管理端。
- `apps/backend`：Fastify 服务、认证、管理 API、Drizzle 仓储和数据库迁移。
- `packages/api-contract`：HTTP Zod Schema、推导类型与 `toFastifySchema()`。

现有业务包括健康检查、会话认证、工作台、用户、角色、数据库动态菜单和字典。脚手架自带的 14 张 PostgreSQL 表统一使用 `sys_` 物理前缀、软删除及五项生命周期审计字段；当前单一迁移基线只面向全新数据库。

## 不可绕过的边界

- HTTP 结构先写共享 Zod Schema；Fastify 在边界执行运行时校验。
- 前后端内置系统能力按 `src/modules/system/<module>/` 组织，产品业务能力按 `src/modules/biz/<module>/` 组织；共享契约继续按 `src/modules/<module>/` 组织，跨模块只依赖已登记的表意公共文件。
- Fastify 是当前唯一后端；没有现实跨语言需求时不维护手写 OpenAPI 或 Java 双实现。
- PostgreSQL 专属 Schema、迁移和查询留在基础设施层，不能宣称只换 import 即可切库。
- 非简单变更同步更新设计、计划、适用的测试或验收边界和 AI 协作记录。

模块或跨层任务继续读[模块边界](module-boundaries.md)与对应[模块设计](README.md)；只有当前设计不足以解释长期取舍时，再从[ADR 索引](../decisions/README.md)选择相关记录。

## 已知缺口

- 尚无 CI 和生产部署基线。
- 细粒度接口权限、组织/租户、生产级初始密码注入仍未实现。
- 健康检查是存活检查，不包含数据库 readiness。
- PostgreSQL/MySQL 可切换仍是愿景，当前实现绑定 PostgreSQL。
