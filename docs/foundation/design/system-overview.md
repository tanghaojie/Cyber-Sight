---
title: 系统概览
status: accepted
owner: project maintainers
updated: 2026-08-10
---

# 系统概览

CYBER（正式名称 `Cyber AI Forge`）是用于快速生成企业应用模块的 pnpm 全栈脚手架，不是某个具体业务系统。它以 `AI-Native Enterprise Application Scaffold` 为英文副标题，以 `AI 驱动的企业应用智能构建平台` 为中文副标题，通过运行时契约、模块边界、后端与契约自动化测试、前端人工验收边界和文档门禁，让人和 AI 在明确约束内持续扩展。产品与创作者品牌边界遵循 [CYBER 品牌与视觉系统](../../forge/design/branding.md)、[ADR-0028](../../forge/decisions/ADR-0028-product-and-creator-brand-separation.md) 和 [ADR-0031](../../forge/decisions/ADR-0031-cyber-ai-forge-brand.md)。

## 初始版本基线

维护者提交 `f10f584` 及其父提交构成 2026-07-29 初始版本的逻辑基线。当前实现、共享契约和测试描述系统怎样工作；现行设计补充边界、数据流、失败模式和验证策略。人类修改优先于 AI 推断和历史文档，冲突处理遵循根目录 `AGENTS.md` 与 [ADR-0024](../decisions/ADR-0024-human-authored-state-authority.md)。

## 当前组成

```text
Vue 3 frontend
    -> inferred TypeScript types
Zod 4 runtime contract
    -> Nest validation and OpenAPI metadata
NestJS 11 + Fastify 5 adapter + Drizzle
    -> PostgreSQL
```

- `apps/frontend`：Vue Router、Pinia、Tailwind CSS、Element Plus 和响应式管理端。
- `apps/backend`：NestJS 服务、Fastify adapter、认证、管理 API、Drizzle 仓储和数据库迁移。
- `apps/website`：独立 Vite + Vue 3 中英文静态推广站，通过 GitHub Actions 发布到 GitHub Pages，不依赖管理端运行时或后端。
- `packages/api-contract`：HTTP Zod Schema、推导类型与适配器无关的 JSON Schema 转换。

现有业务包括健康检查、会话认证、接口日志、工作台、用户、角色、部门、岗位、数据库动态菜单和字典。脚手架自带的 17 张 PostgreSQL 表统一使用 `sys_` 物理前缀、UUIDv7 主键、软删除及五项生命周期审计字段；当前单一 `0000` 初始迁移只面向全新 PostgreSQL 18 数据库，后续 Schema 通过追加迁移演进。

## 不可绕过的边界

- HTTP 结构先写共享 Zod Schema；Nest Pipe 在输入边界执行运行时校验，Interceptor 校验输出契约。
- 前后端内置系统能力按 `src/modules/system/<module>/` 组织，产品业务能力按 `src/modules/biz/<module>/` 组织；共享契约继续按 `src/modules/<module>/` 组织，跨模块只依赖已登记的表意公共文件。
- NestJS + Fastify adapter 是当前唯一后端；没有现实跨语言需求时不维护手写 OpenAPI 或 Java 双实现。
- PostgreSQL 专属 Schema、迁移和查询留在基础设施层，不能宣称只换 import 即可切库。
- 非简单变更同步更新设计、计划、适用的测试或验收边界和 AI 协作记录。

模块或跨层任务继续读[模块边界](module-boundaries.md)与对应[模块设计](README.md)；只有当前设计不足以解释长期取舍时，再从[ADR 索引](../decisions/README.md)选择相关记录。

## 已知缺口

- 管理端与后端尚无 CI 和生产部署基线；当前自动化部署仅覆盖 `apps/website` 的 GitHub Pages 静态产物。
- 细粒度接口权限、组织/租户、生产级初始密码注入仍未实现。
- 健康检查是存活检查，不包含数据库 readiness。
- PostgreSQL/MySQL 可切换仍是愿景，当前实现绑定 PostgreSQL。
