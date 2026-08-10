---
title: Cyber AI Forge 开源推广站协作记录
date: 2026-08-10
status: completed
---

# Cyber AI Forge 开源推广站协作记录

## 用户目标和约束

用户要求把项目介绍与界面展示制作成部署到 GitHub Pages 的中英文单页静态网站，包含滚动三维环形轮播、项目介绍、核心亮点、固定毛玻璃 Header、页内锚点和 GitHub 跳转。用户明确修正语言切换应放在 Header，并要求使用 `ui-ux-pro-max` 设计，其余采用此前建议。

## 关键问答与确认

- Header 同时承载品牌、导航、语言切换和 GitHub 入口。
- 首屏优先表达价值，三维界面展示位于首屏之后。
- 轮播使用自然滚动驱动，不劫持滚轮；移动端和减少动效模式降级。

## AI 的重要假设

- 站点与管理端分离为独立 workspace 应用，更适合 GitHub Pages。
- 仓库没有现成产品截图资产，首版采用与实际能力一致的静态产品场景，不伪造动态业务数据。
- GitHub Pages 默认从主分支通过 GitHub Actions 发布，维护者负责开启仓库 Pages 设置。

## 方案和执行摘要

- 已通过暂存区门禁，任务开始时无未提交变更。
- 已运行文档归档审计，结果为 `NOT_DUE`。
- 已使用 `ui-ux-pro-max` 检索暗色开发者工具落地页设计系统、落地页结构、字体、三维动效可访问性和 Vue 规则。
- 视觉采用“Forge Blueprint / 工业编辑式系统蓝图”，并遵循现行 CYBER 品牌颜色与图形边界。
- 新增独立 `apps/website`，实现固定毛玻璃 Header、Header 内双语切换、移动端菜单、首屏价值主张、自然滚动三维环形展示、核心能力、构建流程、架构、适用人群、快速开始、边界和 GitHub CTA。
- 新增六组静态产品场景、双语本地内容、URL/浏览器语言偏好、SEO/分享元数据、响应式和减少动效降级。
- 新增 GitHub Pages 工作流，使用相对 Vite 基址构建并发布 `apps/website/dist`。

## 验证结果

- `pnpm format`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过，覆盖共享契约、后端、管理端和推广站；推广站产物 gzip 后约 49 kB。
- `git diff --check`：通过。
- `pnpm format:check` 与 `pnpm docs:archive:check:ci` 在归档后通过。
- 未创建或运行前端自动化/浏览器测试；人工验收边界已写入现行设计和计划。

## 未决问题与下一步

- 维护者在仓库 Pages 设置中选择 GitHub Actions 来源，并人工验收桌面/移动端、语言切换、三维轮播、键盘与减少动效场景。
- 首次发布后确认是否配置自定义域名，以及何时用真实压缩截图替换静态产品场景。

## 相关设计、ADR、计划和提交

- [推广站设计](../../../../design/marketing-site.md)
- [ADR-0037](../../../../decisions/ADR-0037-static-marketing-site.md)
- [实施计划](../../../plans/2026-08-10-marketing-site.md)
- 关联提交：`feat(website): add GitHub Pages showcase`
