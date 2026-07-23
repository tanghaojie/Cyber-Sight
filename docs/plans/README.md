# 实施计划索引

## 进行中

当前没有进行中的计划。

## 已归档

- [AI-Friendly Web Scaffold 初始实施计划](archive/2026-06-05-ai-friendly-web-scaffold.md)：由 Superpowers 工作流生成的原始计划。
- [文档治理与 AI 强制规则](archive/2026-07-22-documentation-governance.md)：建立统一文档结构、模板和仓库级 AI 规则。
- [测试、统一接口类型与 PostgreSQL 开发环境](archive/2026-07-22-testing-contract-database-baseline.md)：建立测试、共享类型、迁移和本地数据库基线。
- [人类维护指南、函数风格与统一 API 响应](archive/2026-07-22-maintainer-guide-and-api-response-standard.md)：统一人类开发流程、代码风格、响应、分页和错误码。
- [HTTP 状态策略与前端全局拦截器](archive/2026-07-22-http-status-and-global-interceptor.md)：限定全局 HTTP 错误并区分前端全局与业务模块处理边界。
- [管理系统基础能力](archive/2026-07-22-management-system-foundation.md)：统一软删除审计、认证、管理 API 和现代化管理前端。
- [共享运行时 Schema 契约迁移](archive/2026-07-23-runtime-schema-contract.md)：用单一可执行 Schema 替换 OpenAPI-first 双源链路。
- [Zod Schema 统一迁移](archive/2026-07-23-zod-schema-unification.md)：以 Zod 4 统一环境变量和 HTTP 契约的 Schema 编写 API。
- [前端应用壳组件化与动态页面加载](archive/2026-07-23-frontend-shell-componentization.md)：引入 Tailwind CSS 与 Element Plus，拆分布局组件并实现菜单路由动态加载。

## 使用规则

- 非简单改动开始前，从[计划模板](../templates/implementation-plan-template.md)创建文件。
- 计划必须写清范围、非目标、依赖、任务、验证和回滚策略。
- 实施时更新复选框和偏差，不要让计划停留在最初设想。
- 完成、取消或被替代后移入 `archive/`，并保留最终状态和原因。
