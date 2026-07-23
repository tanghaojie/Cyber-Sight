# 系统设计概览

## 定位

AI Web Scaffold 同时面向个人快速启动和团队统一工程规范。它不是某个业务系统，而是让人和 AI 在明确边界内持续生成业务模块的全栈母版。

## 核心目标

1. 用最少初始化工作跑通前端、后端、数据库和 API 类型链路。
2. 让 AI 能快速增加业务，同时通过契约、测试、设计和计划约束改动范围。
3. 默认使用 TypeScript/Fastify，以共享运行时 Schema 保证前后端类型与 HTTP 边界一致。
4. 让关键决策、设计演进和 AI 协作过程可检索、可回溯。
5. 让不熟悉 Zod、Drizzle 和 Vitest 的全栈维护者能够独立修改和验证项目。

## 当前组成

```text
Vue 3 frontend
      |
      | shared inferred TypeScript types
      v
Zod runtime contract
      |
      | Draft 7 JSON Schema
      v
Fastify validation + Swagger + Drizzle
      |
      v
PostgreSQL
```

pnpm workspace 管理三个包：

- `apps/frontend`：Vue 3 用户界面。
- `apps/backend`：默认的 Fastify 后端实现。
- `packages/api-contract`：前后端共享的运行时 Schema 与推导类型。

当前已包含 `/health` 演示链路，以及管理系统认证、用户、角色、菜单和字典基础业务域。数据库业务表统一采用软删除和五项生命周期审计字段，前端提供响应式管理布局。

## 设计原则

### 可执行契约优先

HTTP 数据先在共享 Zod Schema 中定义，TypeScript 类型从它推导。契约包生成 Draft 7 JSON Schema，Fastify 用于校验、响应序列化和按需生成 Swagger/OpenAPI。

### 默认单实现

Fastify 是默认后端，不同时维护等价 Java 服务。只有明确需求出现时，才为特定模块或整个后端引入 Java；届时先导出并审查 Fastify 生成的 OpenAPI，再建立跨语言发布契约。

### 模块化而非文件堆积

每个业务模块必须具有明确职责、公共接口和测试边界。传输、应用、领域和基础设施职责应逐步分离，路由与 Vue 组件不能承载全部业务规则。

### 文档与代码同生命周期

设计、实施计划、ADR 和 AI 协作记录都是交付物。非简单代码变更没有对应文档时，不视为完成。

## 已知差距

- 前后端统一消费共享运行时 Schema 推导类型；Fastify 直接使用同一 Schema 做请求校验和 Swagger 生成。
- PostgreSQL/MySQL 可切换能力仍是愿景，当前实现绑定 PostgreSQL。
- 已建立测试、契约校验、迁移与配置校验最小基线；仍缺少 CI 和生产部署基线。
- 业务 API 已统一普通响应、分页、错误码和全局错误处理；新增业务模块必须沿用该约定。
- 管理系统已具备基础会话认证和角色/菜单关系，但细粒度按钮权限、组织/租户、初始密码安全注入和生产部署策略仍待后续演进。

这些差距应通过后续 ADR 和实施计划逐步解决，不在没有需求和验证的情况下大规模预构建。
