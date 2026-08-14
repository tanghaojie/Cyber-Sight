---
title: 前端品牌文字配置收敛
type: documentation-archive-review
status: completed
created: 2026-08-11
updated: 2026-08-11
scope: frontend
baseline_commit: 63cf20a920f2d398dc22ce3340bc1118b1ee1f5e
---

# 前端品牌文字配置收敛

## 目标

移除 `VITE_APP_PRODUCT_LABEL`，让 `VITE_APP_TAGLINE` 统一驱动登录页签名和 Logo 下方产品描述；Logo 描述转为大写，无路由专属标题时使用 `VITE_APP_FULL_NAME`。

## 背景与设计依据

- 用户确认保留 `apps/backend/.env.example`，根目录 `.env.example` 已由用户手动删除。
- 当前前端配置在 `apps/frontend/src/config/app.config.ts` 集中解析并提供默认值。
- 现行品牌设计允许部署覆盖品牌文字，且登录签名、Logo 描述和浏览器标题属于不同展示场景。
- 修改前归档审计于 2026-08-11 返回 `NOT_DUE`，没有同事项的活动计划。
- 最终归档审计发现新 ADR 暂时指向尚未归档的计划路径，已通过完成并归档本计划、AI 日志和索引修复。

## 范围

- 前端品牌配置、Logo 展示和动态浏览器标题。
- 前端环境示例、README、品牌设计、前端模块设计和当前 ADR。
- 本次任务的实施计划与 AI 协作记录。

## 非目标

- 不修改后端环境示例。
- 不修改 Logo 图形、favicon、路由契约或本地化资源。
- 不创建或运行前端自动化测试。

## 前置条件和风险

- `VITE_APP_TAGLINE` 在登录页签名中保持原始大小写，在 Logo 描述中调用 `.toUpperCase()`。
- 动态标题有路由专属标题时继续使用路由本地化标题；只有无专属标题时才回退到 `VITE_APP_FULL_NAME`。
- 前端行为仍需维护者人工验收，自动化构建不能替代浏览器验收。

## 实施任务

- [x] 确认暂存区为空、检查现有工作区改动并运行归档审计。
- [x] 更新品牌设计、前端模块设计、README 和当前 ADR。
- [x] 移除 `VITE_APP_PRODUCT_LABEL` 和 `appConfig.productLabel`。
- [x] 将 Logo 产品描述改为 `appConfig.tagline.toUpperCase()`。
- [x] 将无路由专属标题的浏览器标题回退改为 `appConfig.fullName`。
- [x] 更新 AI 协作记录、执行格式化和验证。
- [x] 归档计划与 AI 协作记录并提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm --filter @cyber-ai-forge/frontend build`
- `pnpm lint`
- `pnpm docs:archive:check:ci`（归档前因临时计划链接返回 `DUE`，归档后复跑通过）
- `rg` 搜索确认运行时代码、示例环境文件和操作说明中的旧变量和旧配置属性已清除；历史记录允许保留旧名称。
- 维护者人工验收登录页、侧栏 Logo 和动态浏览器标题。

## 发布与回滚

本次不涉及数据库或后端部署。若白标部署需要分别配置登录签名和 Logo 描述文案，应回滚本次配置收敛，或重新设计独立变量，而不是在展示层继续增加隐式规则。

## 实际偏差与遗留问题

- `pnpm docs:archive:check:ci` 首次发现新 ADR 指向尚未存在的归档计划路径；完成归档并更新索引后该断链可消除。
- 前端构建通过，但保留既有 Sass legacy API、Rollup 注释和大 chunk 警告。
- 浏览器页面的最终视觉和动态标题仍需维护者人工验收；仓库约定不创建前端自动化测试。

## 相关设计、ADR 和 AI 日志

- [CYBER 品牌与视觉系统](../../design/branding.md)
- [前端应用与应用壳](../../design/modules/frontend.md)
- [ADR-20260811-frontend-brand-text-config](../../decisions/ADR-20260811-frontend-brand-text-config.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-11-frontend-brand-text-config.md)
