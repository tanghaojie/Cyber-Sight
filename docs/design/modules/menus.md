---
title: 菜单模块
status: active
owner: maintainers
updated: 2026-07-27
---

# 菜单模块

## 职责与边界

`menus` 是菜单记录、树结构、导航类型规则和当前用户菜单树的数据所有者。它不拥有页面组件实现；前端组合根仅使用菜单中的稳定 `component` 标识查找模块公开加载器。

## 公共接口

- 管理 HTTP：`GET/POST /admin/menus`、`PUT/DELETE /admin/menus/{id}`。
- 导航 HTTP：`GET /navigation/menus`。
- 前端入口：菜单管理页面懒加载器、菜单 API 和菜单类型。
- 契约：`MenuSummary`、`MenuRequest`、`NavigationMenu`、导航树响应。

## 数据流、失败模式与测试

目录可包含子目录、菜单或按钮；菜单配置站内路径与组件标识；按钮配置 `http/https` 外链。写入拒绝自引用和类型字段不匹配；树构造防止循环，按排序稳定输出。测试覆盖树构造、组件/外链校验、CRUD 与动态导航响应。
