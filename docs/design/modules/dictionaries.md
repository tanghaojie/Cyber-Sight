---
title: 字典模块
status: active
owner: maintainers
updated: 2026-07-27
---

# 字典模块

## 职责与边界

`dictionaries` 拥有通用字典项的分页、创建、编辑、软删除和独立管理页面，不承载其他业务模块的专属规则。

## 公共接口

- HTTP：`GET/POST /admin/dictionaries`、`PUT/DELETE /admin/dictionaries/{id}`。
- 前端公共文件：`view-registry.ts` 登记字典管理页面；`dictionaries.api.ts` 暴露字典管理 API。
- 契约：`DictionarySummary`、`DictionaryRequest` 及分页响应。

## 失败模式与测试策略

同一类型和值的组合只在未删除字典项中唯一，数据库使用 `is_deleted = false` 部分唯一索引保证并发安全；软删除后允许新字典项复用相同组合，并可保留多条历史记录。所有读取过滤软删除记录。测试覆盖分页、表单转换、排序、状态、业务错误展示和有效记录唯一索引。

## 相关 ADR、计划和 AI 日志

- [ADR-0015：统一软删除业务唯一性约束](../../decisions/ADR-0015-active-row-business-uniqueness.md)
