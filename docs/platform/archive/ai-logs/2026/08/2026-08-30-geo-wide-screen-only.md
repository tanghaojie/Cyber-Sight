---
title: Geo 横向宽屏布局收敛协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-30
status: completed
---

# Geo 横向宽屏布局收敛协作记录

## 用户目标和约束

维护者确认 Geo 设计只会在横向宽屏使用，要求把该边界写入现行文档，并同步移除此前用于兼容窄屏的代码。

## 关键问答与确认

- Geo 不再考虑窄屏适配；
- 采用现行设计已有的 `1280×720` 人工验收尺寸作为最低支持基线；
- 前端边界禁止创建或运行自动化、端到端和浏览器测试，真实交互继续由维护者人工验收。

## AI 的重要假设

- “横向宽屏”指横向 `1280×720` CSS 像素及更宽桌面视口；
- 只删除按视口宽度进行移动端隐藏、重排、缩窄和字段裁剪的代码；`prefers-reduced-motion`、低高度任务项压缩和 Viewer 尺寸变化重算不是窄屏兼容，继续保留；
- 本次不需要新增窄屏警告页或设备检测逻辑。

## 方案和执行摘要

- 归档审计在首次修改前返回 Platform `NOT_DUE`；
- 更新 Geo 现行设计和验证矩阵，明确窄屏、竖屏、平板和手机不受支持；
- 计划删除 Geo 页面及 Shell 组件中的宽度媒体查询，并把受视口宽度限制的桌面面板宽度恢复为固定审定值；
- 不改动 Cesium 运行时、插件业务、工具算法和现有桌面视觉方向。

## 验证结果

- Geo 模块残留扫描未发现 `max-width`/`min-width` 宽度媒体查询、`100vw` 缩窄表达式或移动端分支；仅保留 `prefers-reduced-motion` 和 `max-height: 720px`；
- `pnpm format`：通过；
- `pnpm format:check`：通过；
- `pnpm lint`：通过；
- `pnpm --filter @cyber-ai-forge/frontend build`：受限环境首次因 Vite/esbuild 读取权限失败，授权环境重跑通过；保留既有 Sass legacy API、`AdminLayout` 动静态导入和大 chunk 警告；
- `pnpm architecture:check`：通过；
- `pnpm docs:archive:check:ci`：计划和协作记录归档后通过，Platform 为 `NOT_DUE`；
- 未创建或运行前端自动化、端到端或浏览器测试。

## 未决问题与下一步

维护者需在横向 `1280×720` 和常用更宽桌面视口人工验收工具轨、面板、检查器、地图控制、错误提示和状态条；窄屏不再验收。

## 相关设计、ADR、计划和提交

- [Geo 当前设计](../../../../design/modules/geo.md)
- [实施计划](../../../../archive/plans/2026-08-30-geo-wide-screen-only.md)
- 关联提交：`feat(geo): remove narrow-screen layout`
