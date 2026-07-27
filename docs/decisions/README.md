# 架构决策记录

ADR 记录会长期影响项目的技术选择及其理由。已接受的 ADR 不直接删除；若决定改变，新增 ADR 并将旧记录标记为 `superseded`。

## 决策列表

- [ADR-0001：以 OpenAPI 作为跨实现 API 契约](ADR-0001-openapi-as-cross-implementation-contract.md)（已被 ADR-0006 取代）
- [ADR-0002：共享 OpenAPI 生成类型并以契约测试校验运行时接口](ADR-0002-shared-generated-api-types.md)（已被 ADR-0006 取代）
- [ADR-0003：统一业务响应、分页和错误码](ADR-0003-unified-api-response-and-error-codes.md)
- [ADR-0004：HTTP 状态与前端全局错误处理边界](ADR-0004-http-status-and-frontend-global-error-handling.md)
- [ADR-0005：统一软删除与审计字段](ADR-0005-soft-delete-and-audit-fields.md)
- [ADR-0006：以共享运行时 Schema 作为内部 API 契约](ADR-0006-runtime-schema-as-api-contract.md)
- [ADR-0007：以 Zod 作为统一 Schema 编写源](ADR-0007-zod-as-unified-schema-source.md)
- [ADR-0008：前端采用 Tailwind CSS 与 Element Plus](ADR-0008-tailwind-and-element-plus.md)
- [ADR-0009：以独立模块目录和公共入口隔离业务能力](ADR-0009-module-folders-and-public-boundaries.md)（入口命名部分已被 ADR-0013 取代）
- [ADR-0010：以数据库菜单树驱动导航并通过受控注册表加载页面](ADR-0010-database-navigation-and-controlled-view-registry.md)
- [ADR-0011：以前端应用处理器执行全局 HTTP 错误行为](ADR-0011-registered-application-http-error-handler.md)
- [ADR-0012：模块页面自动注册与 SCSS 分层](ADR-0012-module-view-registration-and-scss-layering.md)
- [ADR-0013：以表意公共文件替代模块 index.ts](ADR-0013-semantic-module-entry-files.md)
- [ADR-0014：软删除自然键使用部分唯一索引](ADR-0014-soft-delete-natural-key-uniqueness.md)（已被 ADR-0015 取代）
- [ADR-0015：统一软删除业务唯一性约束](ADR-0015-active-row-business-uniqueness.md)

新增 ADR 时从 [ADR 模板](../templates/adr-template.md)复制，使用下一个连续编号。
