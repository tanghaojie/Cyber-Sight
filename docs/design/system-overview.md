# 系统设计概览

## 定位

AI Web Scaffold 同时面向个人快速启动和团队统一工程规范。它不是某个业务系统，而是让人和 AI 在明确边界内持续生成业务模块的全栈母版。

## 核心目标

1. 用最少初始化工作跑通前端、后端、数据库和 API 类型链路。
2. 让 AI 能快速增加业务，同时通过契约、测试、设计和计划约束改动范围。
3. 默认使用 TypeScript/Fastify，保留通过同一 API 契约替换为 Java 后端的能力。
4. 让关键决策、设计演进和 AI 协作过程可检索、可回溯。

## 当前组成

```text
Vue 3 frontend
      |
      | openapi-fetch + generated TypeScript types
      v
OpenAPI contract
      |
      | backend implementation
      v
Fastify + Zod + Drizzle
      |
      v
PostgreSQL
```

pnpm workspace 管理三个包：

- `apps/frontend`：Vue 3 用户界面。
- `apps/backend`：默认的 Fastify 后端实现。
- `packages/openapi-spec`：跨实现共享的 OpenAPI 契约。

目前只有 `/health` 演示链路和示例 `users` 表，没有实际业务域。

## 设计原则

### 契约优先

API 先在 OpenAPI 中定义，再生成客户端类型并实现服务端。契约是 TypeScript 和未来 Java 实现之间的稳定边界。

### 默认单实现

Fastify 是默认后端，不同时维护等价 Java 服务。只有明确需求出现时，才依据 OpenAPI 为特定模块或整个后端引入 Java，避免过早承担双栈成本。

### 模块化而非文件堆积

每个业务模块必须具有明确职责、公共接口和测试边界。传输、应用、领域和基础设施职责应逐步分离，路由与 Vue 组件不能承载全部业务规则。

### 文档与代码同生命周期

设计、实施计划、ADR 和 AI 协作记录都是交付物。非简单代码变更没有对应文档时，不视为完成。

## 已知差距

- OpenAPI 文件、Fastify JSON Schema 和 Zod Schema 当前存在重复定义；本轮将先统一编译期类型来源并增加契约测试，运行时 Schema 生成留待后续演进。
- PostgreSQL/MySQL 可切换能力仍是愿景，当前实现绑定 PostgreSQL。
- 缺少 CI 和生产部署基线；测试、契约校验、迁移与配置校验将在本轮建立最小基线。

这些差距应通过后续 ADR 和实施计划逐步解决，不在没有需求和验证的情况下大规模预构建。
