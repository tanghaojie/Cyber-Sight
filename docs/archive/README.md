# 历史文档归档

本目录保存已完成、被合并、废弃或被取代的证据，不是当前规范，也不属于 AI 默认阅读集。先从下表定位主题，只打开解释当前问题所需的一至两份文件；现行事实返回 [当前文档入口](../README.md) 查询。

## 归档设计

| 文档                                                        | 归档原因                            | 现行来源                                                                    |
| ----------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------- |
| [管理系统基础能力](design/management-system.md)             | 汇总内容已拆入模块设计              | [系统概览](../design/system-overview.md)与各[模块设计](../design/README.md) |
| [动态导航与品牌](design/dynamic-navigation-and-branding.md) | 与前端应用壳和菜单/导航模块设计合并 | [前端应用壳](../design/frontend-shell.md)                                   |
| [旧系统概览](design/system-overview.md)                     | 2026-07-28 压缩前快照               | [当前系统概览](../design/system-overview.md)                                |
| [旧模块边界](design/module-boundaries.md)                   | 2026-07-28 去重前快照               | [当前模块边界](../design/module-boundaries.md)                              |
| [旧前端应用壳](design/frontend-shell.md)                    | 2026-07-28 合并前快照               | [当前前端应用壳](../design/frontend-shell.md)                               |

## 已取代 ADR

| ADR                                                                        | 最终状态                                         | 现行来源                                                                                                      |
| -------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| [ADR-0001](decisions/ADR-0001-openapi-as-cross-implementation-contract.md) | 被 ADR-0006 取代                                 | [ADR-0006](../decisions/ADR-0006-runtime-schema-as-api-contract.md)                                           |
| [ADR-0002](decisions/ADR-0002-shared-generated-api-types.md)               | 被 ADR-0006 取代                                 | [ADR-0006](../decisions/ADR-0006-runtime-schema-as-api-contract.md)                                           |
| [ADR-0009](decisions/ADR-0009-module-folders-and-public-boundaries.md)     | 入口策略被 ADR-0013 取代，其余规则已进入当前设计 | [模块边界](../design/module-boundaries.md)与 [ADR-0013](../decisions/ADR-0013-semantic-module-entry-files.md) |
| [ADR-0014](decisions/ADR-0014-soft-delete-natural-key-uniqueness.md)       | 被 ADR-0015 扩展取代                             | [ADR-0015](../decisions/ADR-0015-active-row-business-uniqueness.md)                                           |
| [ADR-0019](decisions/ADR-0019-jwt-lru-token-cache.md)                      | 错误地把 LRU 容量作为有效会话容量                | [ADR-0020](../decisions/ADR-0020-persistent-jwt-session-cache.md)                                             |

## 完成计划与协作记录

计划位于 `plans/`，对应日志位于 `ai-logs/YYYY/MM/`。它们用于复盘实施过程，不用于定义当前行为。

| 主题                             | 计划                                                                   | AI 日志                                                                            |
| -------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 初始脚手架                       | [计划](plans/2026-06-05-ai-friendly-web-scaffold.md)                   | —                                                                                  |
| 文档治理                         | [计划](plans/2026-07-22-documentation-governance.md)                   | [日志](ai-logs/2026/07/2026-07-22-project-context-and-documentation-governance.md) |
| 菜单动态布局                     | [计划](plans/2026-07-28-menu-dynamic-layouts.md)                       | [日志](ai-logs/2026/07/2026-07-28-menu-dynamic-layouts.md)                         |
| 测试、契约与数据库基线           | [计划](plans/2026-07-22-testing-contract-database-baseline.md)         | [日志](ai-logs/2026/07/2026-07-22-testing-contract-database-baseline.md)           |
| 维护指南与 API 响应              | [计划](plans/2026-07-22-maintainer-guide-and-api-response-standard.md) | [日志](ai-logs/2026/07/2026-07-22-maintainer-guide-and-api-response-standard.md)   |
| HTTP 状态与全局拦截              | [计划](plans/2026-07-22-http-status-and-global-interceptor.md)         | [日志](ai-logs/2026/07/2026-07-22-http-status-and-global-interceptor.md)           |
| 管理系统基础                     | [计划](plans/2026-07-22-management-system-foundation.md)               | [日志](ai-logs/2026/07/2026-07-22-management-system-foundation.md)                 |
| 运行时 Schema 契约               | [计划](plans/2026-07-23-runtime-schema-contract.md)                    | [日志](ai-logs/2026/07/2026-07-23-runtime-schema-contract.md)                      |
| Zod 统一                         | [计划](plans/2026-07-23-zod-schema-unification.md)                     | [日志](ai-logs/2026/07/2026-07-23-zod-schema-unification.md)                       |
| 前端应用壳组件化                 | [计划](plans/2026-07-23-frontend-shell-componentization.md)            | [日志](ai-logs/2026/07/2026-07-23-frontend-shell-componentization.md)              |
| 模块隔离                         | [计划](plans/2026-07-27-module-isolation-constraints.md)               | [日志](ai-logs/2026/07/2026-07-27-module-isolation-constraints.md)                 |
| 动态导航与模块拆分               | [计划](plans/2026-07-27-jtlab-dynamic-navigation.md)                   | [日志](ai-logs/2026/07/2026-07-27-jtlab-dynamic-navigation.md)                     |
| 旧菜单兼容                       | [计划](plans/2026-07-27-legacy-menu-compatibility.md)                  | [日志](ai-logs/2026/07/2026-07-27-legacy-menu-compatibility.md)                    |
| AI Git 门禁                      | [计划](plans/2026-07-27-ai-git-safety-and-attribution.md)              | [日志](ai-logs/2026/07/2026-07-27-ai-git-safety-and-attribution.md)                |
| 页面注册与 SCSS                  | [计划](plans/2026-07-27-frontend-registry-and-scss.md)                 | [日志](ai-logs/2026/07/2026-07-27-frontend-registry-and-scss.md)                   |
| 表意公共文件                     | [计划](plans/2026-07-27-semantic-module-entry-files.md)                | [日志](ai-logs/2026/07/2026-07-27-semantic-module-entry-files.md)                  |
| 应用壳布局                       | [计划](plans/2026-07-27-frontend-layout-refactor.md)                   | [日志](ai-logs/2026/07/2026-07-27-frontend-layout-refactor.md)                     |
| 菜单编码唯一性                   | [计划](plans/2026-07-27-menu-code-soft-delete-uniqueness.md)           | [日志](ai-logs/2026/07/2026-07-27-menu-code-soft-delete-uniqueness.md)             |
| 统一软删除唯一性                 | [计划](plans/2026-07-27-soft-delete-unique-constraints.md)             | [日志](ai-logs/2026/07/2026-07-27-soft-delete-unique-constraints.md)               |
| 文档上下文压缩与统一归档         | [计划](plans/2026-07-28-documentation-context-compression.md)          | [日志](ai-logs/2026/07/2026-07-28-documentation-context-compression.md)            |
| 菜单分层路由与 SVG 图标注册表    | [计划](plans/2026-07-28-menu-routing-svg-icons.md)                     | [日志](ai-logs/2026/07/2026-07-28-menu-routing-svg-icons.md)                       |
| JWT Bearer 与 LRU 认证改造       | [计划](plans/2026-07-28-jwt-lru-authentication.md)                     | [日志](ai-logs/2026/07/2026-07-28-jwt-lru-authentication.md)                       |
| JWT 数据库会话与 LRU 读缓存修正  | [计划](plans/2026-07-28-persistent-jwt-session-cache.md)               | [日志](ai-logs/2026/07/2026-07-28-persistent-jwt-session-cache.md)                 |
| 源码路径、格式化与管理页面组件化 | [计划](plans/2026-07-28-source-format-and-page-components.md)          | [日志](ai-logs/2026/07/2026-07-28-source-format-and-page-components.md)            |
| 前端自动化测试移除               | [计划](plans/2026-07-28-remove-frontend-unit-tests.md)                | [日志](ai-logs/2026/07/2026-07-28-remove-frontend-unit-tests.md)                    |
| API 契约构建别名修复             | [计划](plans/2026-07-28-api-contract-alias-output.md)                 | [日志](ai-logs/2026/07/2026-07-28-api-contract-alias-output.md)                     |

归档内容不继续同步当前实现；发现冲突时以当前设计、现行 ADR、代码和测试为准。
