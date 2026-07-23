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

新增 ADR 时从 [ADR 模板](../templates/adr-template.md)复制，使用下一个连续编号。
