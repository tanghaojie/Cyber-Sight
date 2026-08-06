---
title: 关于项目页与品牌入口
type: documentation-archive-review
status: completed
created: 2026-08-07
updated: 2026-08-07
---

# 关于项目页与品牌入口

## 目标

在登录页和工作台首页补充可访问的 CYBER Logo 与 GitHub 跳转，新增一个具有专业产品展示感的“关于项目”页面，并通过数据库追加迁移把入口放在根菜单最后。

## 背景与设计依据

- 用户提供的项目主页为 <https://github.com/tanghaojie/cyber-scaffold>。
- 现行品牌设计要求使用 CYBER / Cyber Scaffold 产品品牌，JTLab 仅作为创作者署名。
- 前端系统能力必须位于 `apps/frontend/src/modules/system/<module>/`，菜单页面通过 `registerViews.ts` 登记。
- 动态菜单只能通过追加 Drizzle SQL 迁移演进，静态首页不写入数据库菜单。
- 2026-08-07 `pnpm docs:archive:check` 返回 `DUE`，原因是检测到架构变更；本计划同时作为当前文档补充与归档审查入口。

## 范围

- 新增 `system/about` 前端模块与中英文固定文案。
- 设计并实现“工程展陈”风格的关于项目页：品牌 Hero、工程蓝图、核心能力、技术栈、GitHub CTA 和 CSS 动画。
- 登录页桌面/移动 Logo 与首页品牌入口链接到 GitHub，并保留新窗口安全属性。
- 新增 `0003_about_project_menu.sql`，把 `关于项目` 作为无权限根级菜单置于现有菜单之后。
- 更新当前设计索引、相关模块设计、实施日志；完成后归档本计划与日志并更新归档索引。

## 非目标

- 不新增 API 契约、后端接口或业务数据库表。
- 不修改现有认证、导航过滤、动态路由生成和权限语义。
- 不创建前端自动化测试或浏览器测试；浏览器行为按仓库规则由维护者人工验收。
- 不读取或恢复 `docs/archive/**` 中的历史方案。

## 前置条件和风险

- About 页面依赖现有 `AdminLayout` 与构建期 `viewRegistry` 发现机制。
- 外部 GitHub 链接必须使用 `target="_blank"` 与 `rel="noopener noreferrer"`。
- 迁移只面向当前新基线的空 PostgreSQL 数据库；重复执行必须幂等，不能覆盖用户修改过的菜单。
- 视觉动效使用 CSS，必须为 `prefers-reduced-motion: reduce` 提供静态降级。

## 实施任务

- [x] 检查暂存区、现行文档、活动计划和归档审计状态。
- [x] 更新当前设计与 AI 协作记录。
- [x] 实现 About 模块、Logo GitHub 入口和模块文案。
- [x] 新增数据库菜单迁移并登记迁移 journal。
- [x] 执行格式化、格式检查、类型检查、构建和适用后端测试。
- [x] 更新实际验证结果、归档本计划与日志并提交变更。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm build`
- `pnpm test`
- 具备 PostgreSQL 时运行 `pnpm test:db`，否则明确记录环境限制。
- 维护者人工验收登录页、首页、关于项目页的 Logo 跳转、菜单末尾顺序、响应式布局和减少动效模式。

实际结果：`pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm build`、`pnpm test` 和 `pnpm test:db` 均通过；后端测试为 14 个文件、121 个测试。数据库检查连接 PostgreSQL 18.4，并确认 `sys_users` 与 `drizzle.__drizzle_migrations` 存在。`pnpm db:migrate` 未执行，因为本任务只生成迁移，不直接修改当前数据库。

## 发布与回滚

发布前按当前仓库规则提交带真实模型 trailer 的 Git 提交。若 About 页面需回滚，移除前端模块、入口链接和 `0003` 迁移，并在全新数据库重新执行剩余迁移；不对已执行迁移做原地修改。

## 实际偏差和遗留问题

实现过程中发现迁移基线测试固定断言 3 条 journal；已将其更新为 4 条并增加 `0003_about_project_menu.sql` 的幂等与字段断言。生产构建仍输出仓库既有的 Sass legacy API、Rollup 注释和静态/动态重复导入警告，不影响构建成功。浏览器视觉与外链行为仍需维护者人工验收。

## 相关设计、ADR 和 AI 日志

- [前端应用与应用壳](../../design/modules/frontend.md)
- [工作台模块](../../design/modules/home.md)
- [认证模块](../../design/modules/auth.md)
- [菜单模块](../../design/modules/menus.md)
- [CYBER 品牌与视觉系统](../../design/branding.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-07-about-project.md)
- 归档审计：本次 `pnpm docs:archive:check` 初始返回 `DUE`（architecture change detected）；已补充当前 Design、Plan 与 AI Log，归档完成后同步更新 archive ledger。
