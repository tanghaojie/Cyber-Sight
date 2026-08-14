---
title: 提取前端浏览器存储访问能力
date: 2026-07-31
status: completed
---

# 提取前端浏览器存储访问能力

## 用户目标和约束

用户要求将项目中大量重复的 `browserStorage` 方法放入 `shared`。仓库要求跨模块变更先维护设计、计划和 AI 协作记录，完成验证后归档并自动提交。

## 关键问答与确认

定位到 `accessToken.ts`、`localization.ts` 和 `tag-view.store.ts` 中的三个同构实现；暂存区在修改前为空，未发现同一事项的活动计划。

## AI 的重要假设

三个实现语义一致，因此共享函数应继续安全返回 `Storage | null`，不替调用点合并其各自的异常处理或持久化规则。

## 方案和执行摘要

新增 `shared/browserStorage.ts`，由它统一处理 SSR 与受限 `localStorage` 访问；三个调用点改为显式导入。设计文档登记 shared 公共文件及相关依赖流。

## 验证结果

已通过 `pnpm format`、`pnpm format:check`、`pnpm lint` 和
`pnpm --filter @scaffold/frontend build`。生产构建只有既有的 Sass legacy API、VueUse PURE
注释和动态/静态导入分包提示；未出现失败或本次改动相关的诊断。

## 未决问题与下一步

无；计划和本文已标记完成，等待归档和创建带 AI 标记的提交。

## 相关设计、ADR、计划和提交

- [前端应用与应用壳](../../../design/modules/frontend.md)
- [前端运行时多语言模块](../../../design/modules/localization.md)
- [前端标签历史模块](../../../design/modules/tag-view.md)
- [实施计划](../../../plans/2026-07-31-shared-browser-storage.md)
- 不新增 ADR：本次仅复用已有的领域无关平台能力。
- 关联提交：`refactor(frontend): share browser storage access`。
