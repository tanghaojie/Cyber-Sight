---
title: 关于项目页与品牌入口
date: 2026-08-07
status: completed
---

# 关于项目页与品牌入口

## 用户目标和约束

- 用户要求读取根目录 `README.md`。
- 在登录页和首页添加 Logo 与 GitHub 跳转。
- 新增一个比 README 更有设计感的“关于项目”页面，允许使用图片、图标和动画。
- 生成数据库迁移，并把菜单配置在现有菜单最后。

## 关键问答与确认

- 当前工作区无未提交修改，暂存区门禁通过。
- `pnpm docs:archive:check` 在受控权限下返回 `DUE`，原因是检测到架构变更；已用本任务计划承接归档审查。
- 现行设计规定静态首页不进入数据库菜单，动态页面必须通过所属模块的 `registerViews.ts` 登记。

## AI 的重要假设

- “Logo 和跳转”指向用户给出的 GitHub 项目主页；外链在新标签页打开。
- “关于项目”是脚手架自带的 `system/about` 页面，不需要后端 API 或新表。
- “菜单配置在最后面”指根菜单使用高于现有菜单的 `sort_order`，并保持迁移幂等。

## 方案和执行摘要

- 采用 CYBER 工程展陈视觉：深色品牌 Hero、工程蓝图节点、分层架构轨道、薄荷绿/电紫点缀、CSS 动效和 GitHub CTA。
- 复用 `CyberLogo`、`AppIcon`、现有多语言资源发现和 `AdminLayout`，不引入运行时网络资源。
- 追加 `0003_about_project_menu.sql`，用 `NOT EXISTS` 避免覆盖维护者已有菜单修改。

## 验证结果

`pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm build`、`pnpm test` 均通过；后端与共享契约测试为 14 个文件、121 个测试。`pnpm test:db` 通过，连接 PostgreSQL 18.4，发现 `sys_users` 与 `drizzle.__drizzle_migrations`。构建只保留已有 Sass/Vite/Rollup 警告；未执行 `pnpm db:migrate`，避免未经用户要求修改当前数据库。迁移测试已同步覆盖 4 条 journal 与 `0003_about_project_menu.sql` 的幂等配置。

## 未决问题与下一步

- 代码、迁移和文档已完成；登录页、首页、关于项目页的视觉与 GitHub 外链仍需维护者在浏览器中人工验收。
- 完成本记录归档并更新 archive ledger。

## 相关设计、ADR、计划和提交

- [关于项目实施计划](../../../../plans/2026-08-07-about-project.md)
- [前端应用与应用壳](../../design/modules/frontend.md)
- [菜单模块](../../design/modules/menus.md)
