---
title: 初始版本文档基线整理
date: 2026-07-29
status: completed
---

# 初始版本文档基线整理

## 用户目标和约束

- 审阅维护者对项目的修改，但不得改动维护者写下的业务内容。
- 以维护者实现为事实来源，补充并整理文档。
- 在仓库中加入长期原则：人类修改优先；发现 bug、问题或未同步文档时先询问人类下一步。
- 把当前版本视为初始版本，合并并归档此前重复设计、文档和 ADR，只保留必要的现行内容。
- 维护者明确允许运行 `pnpm format`，因为该操作只改变格式，不改变逻辑。

## 关键问答与确认

- 初次检查发现 `pnpm format:check` 在 31 个既有文件上失败；`pnpm lint` 和 `pnpm build` 通过。
- 维护者随后授权仓库级 `pnpm format`。

## AI 的重要假设

- 最近四个维护者提交 `19dbbdc`、`267e841`、`75860ab`、`f10f584` 构成本次需要同步的初始版本修改。
- 格式化授权仅覆盖项目 Prettier 配置产生的机械排版，不授权业务逻辑改动。
- 初始版本之前的技术选择应保留在归档中供追溯，其当前结果由精简后的现行设计描述。

## 方案和执行摘要

- 已在任何修改前确认暂存区为空。
- 已审阅路由、认证、菜单显示、页面/布局注册表、共享 token 适配器、契约和 TypeScript 配置修改。
- 已运行获准的 `pnpm format`；对源码执行忽略空白差异检查后无逻辑差异。
- 已在 `AGENTS.md`、文档治理和 ADR-0024 中加入人类修改优先与冲突升级规则。
- 已同步认证响应/cookie、认证 API 分层、路由守卫、动态嵌套路由、`registerViews.ts`、空目录隐藏和 TypeScript 配置。
- 已把独立前端应用壳设计合并到前端模块设计，并把 ADR-0001 至 ADR-0023 归档为初始版本形成过程。

## 验证结果

- 修改前：`pnpm lint` 通过；`pnpm build` 通过；`pnpm format:check` 因 31 个既有格式差异失败。
- 格式化后：`git diff --ignore-all-space --exit-code -- apps/backend apps/frontend RTK.md` 通过；`git diff --check` 通过。
- 最终 `pnpm format:check`、`pnpm lint`、`pnpm test` 和 `pnpm build` 全部通过；后端 9 个测试文件、63 个测试通过。
- 117 份 Markdown 相对链接检查、`git diff --check` 和忽略空白后的源码差异检查通过。
- 前端构建保留 Sass legacy API、第三方 PURE 注释和 `AdminLayout.vue`/`HomePage.vue` 静态与动态重复导入提示，不影响构建成功。

## 未决问题与下一步

- 前端功能和浏览器行为仍由维护者人工验收。
- `auth.api.ts` 的 `gerCurrentUser` 命名和 `auth.store.ts` 的存量未使用导入未修改；是否清理由维护者决定。
- `AdminLayout.vue` 与 `HomePage.vue` 的重复导入拆包提示已写入当前前端设计，是否调整由维护者决定。

## 相关设计、ADR、计划和提交

- [实施计划](../../../plans/2026-07-29-initial-version-documentation-baseline.md)
- [分层文档与历史归档](../../../../design/documentation-governance.md)
- [ADR-0024：以人类修改和初始版本实现为准](../../../../decisions/ADR-0024-human-authored-state-authority.md)
- 本记录随提交 `docs: establish initial version baseline` 归档。
