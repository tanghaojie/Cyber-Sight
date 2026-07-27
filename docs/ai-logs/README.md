# AI 协作记录

AI 协作记录用于回溯用户与 AI 在一次任务中的目标、关键确认、重要假设、实施结果和遗留问题。

## 目录与命名

```text
ai-logs/YYYY/MM/YYYY-MM-DD-<topic>.md
```

同一任务跨多轮对话时优先更新同一文件；目标明显变化时创建新文件。使用 [AI 日志模板](../templates/ai-session-log-template.md)。

## 记录与不记录

应记录：用户目标、关键问答、方案选择、重要假设、实际验证、未决事项和相关文档。

不记录：完整聊天复制、敏感信息、无关闲聊、大段命令输出，以及 Git 已能清楚表达的逐行改动。

## 记录索引

- [2026-07-22：项目背景确认与文档治理](2026/07/2026-07-22-project-context-and-documentation-governance.md)
- [2026-07-22：测试、接口契约与 PostgreSQL 基线](2026/07/2026-07-22-testing-contract-database-baseline.md)
- [2026-07-22：维护者指南与统一 API 响应](2026/07/2026-07-22-maintainer-guide-and-api-response-standard.md)
- [2026-07-22：HTTP 状态与前端全局拦截器](2026/07/2026-07-22-http-status-and-global-interceptor.md)
- [2026-07-22：管理系统基础能力](2026/07/2026-07-22-management-system-foundation.md)
- [2026-07-23：从 OpenAPI-first 迁移到共享运行时 Schema](2026/07/2026-07-23-runtime-schema-contract.md)
- [2026-07-23：统一使用 Zod Schema](2026/07/2026-07-23-zod-schema-unification.md)
- [2026-07-23：前端应用壳组件化与动态页面加载](2026/07/2026-07-23-frontend-shell-componentization.md)
- [2026-07-27：模块隔离与独立目录约束](2026/07/2026-07-27-module-isolation-constraints.md)
