---
title: 前端导航模块
status: active
owner: maintainers
updated: 2026-07-27
---

# 前端导航模块

## 职责与边界

`navigation` 获取并缓存当前用户数据库菜单树，公开只读树、扁平节点、加载状态和清理/刷新命令。它不拥有菜单 CRUD，也不直接注册 Vue Router；动态路由注册由应用组合根完成。

## 公共接口

- `navigation.store.ts` 暴露 `useNavigationStore()`：`items`、`flatItems`、`load(force)`、`clear()`。
- 后端依赖：`GET /navigation/menus`。

## 失败模式与测试

加载失败不保留旧树；401 由全局处理器清理。测试覆盖树获取、目录渲染、站内/外链行为和动态路由组件白名单。
