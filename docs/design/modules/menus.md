---
title: 菜单模块
status: active
owner: maintainers
updated: 2026-07-27
---

# 菜单模块

## 职责与边界

`menus` 是菜单记录、树结构、导航类型规则、布局标识和当前用户菜单树的数据所有者。它不拥有页面组件或布局实现；前端组合根仅使用菜单中的稳定 `component` 与 `layout` 标识查找构建期注册的加载器。

## 公共接口

- 管理 HTTP：`GET/POST /admin/menus`、`PUT/DELETE /admin/menus/{id}`。
- 导航 HTTP：`GET /navigation/menus`。
- 前端公共文件：`view-registry.ts` 登记菜单管理页面；`menus.api.ts` 暴露菜单 API；`menu-options.ts` 暴露角色授权所需的 `listMenuTreeOptions` 与 `MenuTreeOption`。
- 契约：`MenuSummary`、`MenuRequest`、`NavigationMenu`、导航树响应。

## 数据流、失败模式与测试

目录可包含子目录、菜单或按钮；目录和菜单可配置布局标识，菜单另配置站内路径与组件标识，按钮配置 `http/https` 外链且布局必须为空。空布局表示由前端继承最近目录布局，并最终回退默认布局。写入拒绝自引用和类型字段不匹配；树构造防止循环，按排序稳定输出。测试覆盖树构造、布局/组件/外链校验、CRUD 与动态导航响应。

写入模型保持严格类型约束；读取摘要兼容旧版本的不规范字段组合，避免存量单条记录阻断整个管理列表。运行时导航会过滤缺少站内路径/组件标识的菜单和缺少 HTTP(S) 地址的外链按钮，旧记录仍可在菜单管理中编辑修复。

菜单编码 `code` 只在未删除记录中唯一。数据库使用条件为
`is_deleted = false` 的部分唯一索引保证并发写入安全；软删除记录保留历史编码，
但不阻止重新创建相同编码的菜单。更新未删除菜单时仍不得与另一条未删除记录重码。
Schema 测试校验该索引是唯一索引且带有软删除条件，迁移测试/真实数据库验证覆盖
“删除后复用编码”和“两个未删除菜单重码仍被拒绝”。

## 兼容性与迁移

迁移删除旧的 `menus_code_unique` 全表唯一约束，并建立
`menus_code_active_unique` 部分唯一索引。迁移不会改写或删除现有菜单数据；现有数据库
在旧约束下不可能存在重复编码，因此建立新索引前无需数据清洗。

## 相关 ADR、计划和 AI 日志

- [ADR-0015：统一软删除业务唯一性约束](../../decisions/ADR-0015-active-row-business-uniqueness.md)
