---
title: 前端导航模块
status: active
owner: maintainers
updated: 2026-07-30
---

# 前端导航模块

## 职责与边界

`navigation` 获取并缓存后端按当前用户有效权限过滤后的数据库菜单树（包括稳定页面和布局标识），公开只读树、扁平节点、加载状态和清理/刷新命令。它不自行解释权限键、不拥有菜单 CRUD，也不直接注册 Vue Router；动态路由注册由应用组合根完成。

## 公共接口

- `navigation.store.ts` 暴露 `useNavigationStore()`：`items`、`flatItems`、`loaded`、`loading`、`error`、`load(force)`、`clear()`。
- 后端依赖：`GET /navigation/menus`。

`navigation.api.ts` 负责请求并拒绝缺失或非零业务响应。store 在缓存前调用 `resolveNavigationPaths()`：根节点必须能解析为绝对路径，目录为后代提供父路径，子节点相对路径拼接父目录，以 `/` 开头的路径覆盖上级路径；按钮保留自身空站内路径。

应用首页 `/` 由静态路由直接注册，不依赖数据库菜单。数据库动态路由从 `/sys` 和 `/config` 两个根目录开始，避免与静态首页重复注册或出现同路径菜单项。

## 失败模式与测试

加载失败不保留旧树，错误会继续抛给路由守卫；401 由全局处理器清理。后端自动化测试覆盖树获取和动态导航响应；目录渲染、站内/外链行为、路径解析、嵌套路由和组件/布局白名单由维护者人工验收。
