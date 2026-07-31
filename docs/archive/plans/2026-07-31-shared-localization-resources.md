---
title: 提取前端共享多语言资源
status: completed
created: 2026-07-31
updated: 2026-07-31
---

# 提取前端共享多语言资源

## 目标

将新增、查看、删除等领域无关的前端中英文界面文案及资源定义移入 `apps/frontend/src/shared/localization/`，供系统和后续业务模块统一复用。

## 背景与设计依据

运行时多语言模块目前同时拥有语言状态、资源加载机制和跨模块的通用界面文案。通用文案不属于 localization 自身领域，放在 shared 后可保持业务模块只依赖平台能力，并使用稳定的 `shared.*` 翻译键。依据[模块边界](../../design/module-boundaries.md)、[前端应用与应用壳](../../design/modules/frontend.md)和[前端运行时多语言模块](../../design/modules/localization.md)。

## 范围

- 新增共享资源定义和 `shared` 命名空间的通用操作、状态、表格、确认与消息文案。
- 将现有代码中对原通用键的调用迁移到 `shared.*`。
- 让资源加载器发现 shared 下的 `*.locales.ts`，并将资源定义辅助函数迁出 localization 模块。
- 更新相关设计和协作记录。

## 非目标

- 不翻译用户录入数据，不修改后端、数据库或 API 契约。
- 不改动模块专属的领域文案、确认语句或错误提示。
- 不新增语言种类或改变语言持久化行为。

## 前置条件和风险

- shared 资源必须继续通过同一中英文键集合校验，并只承载领域无关文案。
- 资源发现范围扩大后，仍须维持命名空间唯一校验，避免与模块资源冲突。

## 实施任务

- [x] 创建共享资源定义与通用文案。
- [x] 调整资源发现和全部调用方的翻译键。
- [x] 更新设计、格式化并完成静态与生产构建验证。

## 测试与验证

- `pnpm format`、`pnpm format:check` 和 `pnpm lint` 通过。
- `pnpm --filter @scaffold/frontend build` 通过，覆盖前端 `vue-tsc` 和 Vite 生产构建。
- 维护者人工确认中英文切换后共享操作、状态和提示在相关页面保持正确显示。

## 发布与回滚

仅重组前端静态资源和引用键，不涉及数据迁移。若需回滚，可将调用键与资源文件一并恢复到本次变更前状态。

## 实际偏差和遗留问题

无实际偏差或遗留问题。Vite 继续输出既有 Sass legacy API 及静态、动态重复导入警告，不影响构建结果。

## 相关设计、ADR 和 AI 日志

- [前端应用与应用壳](../../design/modules/frontend.md)
- [前端运行时多语言模块](../../design/modules/localization.md)
- [ADR-0029](../../decisions/ADR-0029-frontend-runtime-localization.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-31-shared-localization-resources.md)
