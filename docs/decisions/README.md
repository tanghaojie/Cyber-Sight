# 现行架构决策索引

本目录只保留初始版本之后仍需要解释的长期决策。当前技术事实优先从[设计索引](../design/README.md)、共享契约、测试和代码读取；初始版本形成过程中的 ADR-0001 至 ADR-0023 已完整归档。

## 当前决策

- [ADR-0024](ADR-0024-human-authored-state-authority.md)：人类修改优先，初始版本实现与精简设计构成当前基线，发现冲突或问题时由人类决定下一步。
- [ADR-0025](ADR-0025-pluggable-authorization-and-data-scope.md)：默认使用本地可插拔授权 Provider，以稳定权限键和查询计划实现功能与数据权限。
- [ADR-0026](ADR-0026-system-table-prefix-and-fresh-baseline.md)：框架表统一使用 `sys_` 物理前缀，并以只面向全新数据库的单一迁移重置早期历史。
- [ADR-0027](ADR-0027-system-and-business-module-classification.md)：前后端模块按 `system` 与 `biz` 分类，公共契约路径保持稳定。
- [ADR-0028](ADR-0028-product-and-creator-brand-separation.md)：使用 CYBER 作为产品品牌，并把 JTLab 限定为明确、独立的创作者署名。
- [ADR-0029](ADR-0029-frontend-runtime-localization.md)：使用独立前端模块提供运行时中英文切换，以模块资源和严格默认菜单指纹保护用户录入数据。
- [ADR-0033](ADR-0033-task-scoped-documentation-archive-audit.md)：按任务范围触发归档审计，并以合并前检查作为跨 AI 的共享兜底协议；取代已归档的 ADR-0030。
- [ADR-0031](ADR-0031-cyber-ai-forge-brand.md)：将正式产品名更新为 Cyber AI Forge，并同步项目级认证与浏览器存储标识。
- [ADR-0032](ADR-0032-nestjs-fastify-adapter.md)：后端迁移到 NestJS 11，继续使用 Fastify 5 adapter，并保留共享 Zod 契约为唯一 HTTP 数据源。
- [ADR-0034](ADR-0034-position-organization-ownership.md)：岗位作为按部门归属的组织主数据，由独立 `positions` 模块拥有用户岗位关系，不参与授权。

新增 ADR 时使用 [ADR 模板](../templates/adr-template.md)和下一个连续编号。ADR 被取代或被后续基线吸收后更新替代关系并移入 `docs/archive/decisions/`，编号不得复用。
