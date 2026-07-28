# 现行架构决策索引

本目录只保留仍有效的 ADR。按任务主题选择相关记录，不要顺序读取全部 ADR；已取代记录见[归档索引](../archive/README.md)。

## API、错误与数据

- [ADR-0003](ADR-0003-unified-api-response-and-error-codes.md)：统一业务响应、分页和错误码。
- [ADR-0004](ADR-0004-http-status-and-frontend-global-error-handling.md)：HTTP 401/404/500 与业务错误的处理边界。
- [ADR-0005](ADR-0005-soft-delete-and-audit-fields.md)：统一软删除和生命周期审计字段。
- [ADR-0006](ADR-0006-runtime-schema-as-api-contract.md)：共享运行时 Schema 作为内部 HTTP 契约。
- [ADR-0007](ADR-0007-zod-as-unified-schema-source.md)：Zod 4 是 Schema 编写源。
- [ADR-0015](ADR-0015-active-row-business-uniqueness.md)：有效业务记录使用部分唯一索引。
- [ADR-0020](ADR-0020-persistent-jwt-session-cache.md)：数据库持久化全部 JWT 会话，实例内 LRU 只缓存最近 100 个验证结果。

## 前端与模块边界

- [ADR-0008](ADR-0008-tailwind-and-element-plus.md)：Tailwind CSS 与 Element Plus 的职责分工。
- [ADR-0010](ADR-0010-database-navigation-and-controlled-view-registry.md)：数据库导航与受控页面注册表。
- [ADR-0011](ADR-0011-registered-application-http-error-handler.md)：应用注入全局 HTTP 错误处理器。
- [ADR-0012](ADR-0012-module-view-registration-and-scss-layering.md)：模块页面自动注册与 SCSS 分层。
- [ADR-0013](ADR-0013-semantic-module-entry-files.md)：使用表意公共文件，不使用模块 barrel。
- [ADR-0017](ADR-0017-database-selected-layout-registry.md)：菜单选择构建期受控布局，并按目录继承生成动态路由。
- [ADR-0018](ADR-0018-vite-svg-icon-registry.md)：由 Vite 构建期生成 SVG sprite、名称清单和菜单图标选项。

## 工程治理

- [ADR-0016](ADR-0016-tiered-documentation-and-archive.md)：当前文档与历史证据分层归档。

新增 ADR 时使用 [ADR 模板](../templates/adr-template.md)和下一个连续编号。ADR 被取代后更新替代关系并移入 `docs/archive/decisions/`，编号不得复用。
