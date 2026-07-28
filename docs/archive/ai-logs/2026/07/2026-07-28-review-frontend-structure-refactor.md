---
title: 审查并修复前端工程结构重构
date: 2026-07-28
status: completed
archived: 2026-07-28
---

# 审查并修复前端工程结构重构

## 用户目标和约束

用户已提交一组项目修改，要求从提交记录检查问题；有问题则修复，无论是否修复都要按修改内容更新项目文档。

仓库要求先通过暂存区硬门禁，非简单改动同步设计、实施计划和 AI 日志；前端不创建或运行自动化测试，交付前执行格式、类型和生产构建验证，完成后创建带真实模型 trailer 的提交。

## 关键问答与确认

- 未额外询问提交范围；以最近一次带 AI trailer 的 `41d79ac` 为基线，覆盖其后的 5 个维护者提交（截至 `28b4f75`）。
- 保留维护者拆分路由和抽取通用能力的方向，只修复确认的行为、依赖边界、命名和文档问题。

## AI 的重要假设

- 这 5 个连续人工提交属于用户所指的本次修改。
- 历史归档用于保留当时事实，不应因当前源码重命名而改写。
- 本轮不形成新的长期技术决策，执行现有模块边界和 ADR 即可，无需新增 ADR。

## 方案和执行摘要

- 将导航守卫从多次调用 `next()` 改为返回导航结果，公开页、未认证、首次动态路由安装、404 和正常放行分支各自只结束一次。
- 保留 `constRoutes.ts` 与 `dynamicRoutes.ts` 的职责拆分；将页面登记协议和构造函数保留在 `shared`，把扫描业务模块的 `import.meta.glob` 恢复到 `router/view-registry.ts`。
- 将存在双重拼写错误且反向依赖 Router/业务 store 的 API 文件替换为 `bootstrap/registerHttpErrorHandler.ts`，明确其应用组合职责。
- `shared/genInitials.ts` 改为纯函数，品牌配置层负责组合 `brandInitials()`；访问令牌存储保留在领域无关 `shared` 适配器。
- 恢复被当前源码命名误改的历史事件名、历史页面注册路径和 ADR 链接；更新现行前端设计以登记最终文件职责。

## 验证结果

- `pnpm format` 与 `pnpm format:check` 通过。
- `pnpm --filter @scaffold/frontend build` 通过，`vue-tsc` 和 Vite 生产构建成功。
- `pnpm build` 通过，契约、后端、前端全部成功。
- `pnpm test` 通过：9 个后端测试文件、63 项测试成功；契约产物验证通过。
- CodeGraph 复核未发现 `shared` 反向扫描业务模块或路由守卫重复完成导航的剩余路径。
- Markdown 链接检查与 `git diff --check` 通过。
- 前端人工验收边界未改变，未创建或运行前端自动化测试。

## 未决问题与下一步

- 维护者人工验收公开页、未登录重定向、登录后首次动态路由、404 和 HTTP 401 清会话。
- 既有 Dart Sass legacy API 与第三方 Rollup 注释警告可在依赖升级任务中处理，不阻塞本轮。

## 相关设计、ADR、计划和提交

- `docs/design/frontend-shell.md`
- `docs/design/modules/frontend.md`
- `docs/archive/plans/2026-07-28-review-frontend-structure-refactor.md`
- 提交主题：`fix(frontend): stabilize refactored app structure`
