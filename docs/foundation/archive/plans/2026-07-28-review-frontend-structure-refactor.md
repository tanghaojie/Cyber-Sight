---
title: 审查并修复前端工程结构重构
status: completed
created: 2026-07-28
updated: 2026-07-28
archived: 2026-07-28
---

# 审查并修复前端工程结构重构

## 目标

以最近一次 AI 提交 `41d79ac` 为基线，审查其后 5 个维护者提交，修复确认的功能和模块边界问题，并让现行文档准确描述最终结构。

## 背景与设计依据

本轮提交拆分了静态路由、动态路由、全局 HTTP 错误注册、访问令牌存储和品牌缩写工具。审查依据为 `docs/design/module-boundaries.md`、`docs/design/frontend-shell.md`、`docs/design/modules/frontend.md` 及 ADR-0010、ADR-0011、ADR-0012、ADR-0017。

## 范围

- 审查 `41d79ac..28b4f75` 的前端源码和文档差异。
- 修复导航守卫重复完成导航的问题。
- 保留路由职责拆分，同时恢复应用组合根、业务模块和 `shared` 的单向依赖。
- 修正全局 HTTP 错误注册入口与纯缩写工具的所有权。
- 恢复被源码重命名误改的历史归档内容，更新现行设计。

## 非目标

- 不新增前端自动化测试或浏览器测试。
- 不改变后端、API 契约、数据库或业务接口。
- 不改变动态菜单的路径、布局继承和页面白名单语义。

## 前置条件和风险

- 任务开始时 `git diff --cached --quiet` 已通过，工作区干净。
- 前端浏览器行为仍需维护者人工验收；类型检查和生产构建不能替代功能验收。
- Vite/esbuild 在沙箱内无法读取上级运行时目录，最终构建和测试经授权在沙箱外完成。

## 实施任务

- [x] 修复路由守卫控制流并保持动态路由初始化语义。
- [x] 调整页面注册、错误处理注册和缩写工具的依赖方向。
- [x] 统一受影响导入与命名，复核所有旧路径引用。
- [x] 更新现行设计并恢复历史归档证据。
- [x] 完成格式、构建、测试边界和最终差异验证。

## 测试与验证

- `pnpm format`：通过。
- `pnpm format:check`：通过。
- `pnpm --filter @scaffold/frontend build`：通过，包含 `vue-tsc` 和 Vite 生产构建，共转换 1833 个模块。
- `pnpm build`：通过，契约、后端和前端全部构建成功。
- `pnpm test`：通过，后端 9 个测试文件、63 项测试全部成功，契约产物别名校验通过。
- Markdown 链接检查和 `git diff --check`：通过。
- 前端自动化测试按 ADR-0022 不存在也未创建；公开页、未登录重定向、登录后动态菜单首次进入、404、401 清会话仍由维护者人工验收。

## 发布与回滚

修改仅涉及前端源码和文档，随常规前端构建发布。若出现回归，可回滚本轮单一修复提交，不需要数据库迁移。

## 实际偏差和遗留问题

- 修改前并发运行根构建和根测试会竞争 `packages/api-contract/dist`，曾产生一次瞬时别名残留误报；改为顺序运行后两项均通过，未发现产物问题。
- Vite 构建继续报告既有 Dart Sass legacy API 和第三方 `PURE` 注释警告，不影响构建成功。
- 未新增 ADR；最终实现遵循现有模块边界和 ADR，没有形成新的长期取舍。
- 前端功能验收仍由维护者完成。

## 相关设计、ADR 和 AI 日志

- `docs/design/frontend-shell.md`
- `docs/design/module-boundaries.md`
- `docs/design/modules/frontend.md`
- `docs/decisions/ADR-0010-database-navigation-and-controlled-view-registry.md`
- `docs/decisions/ADR-0011-registered-application-http-error-handler.md`
- `docs/decisions/ADR-0012-module-view-registration-and-scss-layering.md`
- `docs/decisions/ADR-0017-database-selected-layout-registry.md`
- `docs/archive/ai-logs/2026/07/2026-07-28-review-frontend-structure-refactor.md`
- 提交主题：`fix(frontend): stabilize refactored app structure`
