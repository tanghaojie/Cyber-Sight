---
title: 官网中英文静态入口与 SEO 增强
date: 2026-08-10
status: completed
---

# 官网中英文静态入口与 SEO 增强

## 用户目标和约束

- 用户希望提升 `apps/website` 的中文和英文 SEO。
- 用户确认采用单一源码、构建时生成两个语言静态入口的方向。
- 不复制两套 Vue 页面逻辑，不修改管理端、后端、数据库或 API。

## 关键问答与确认

- 可以不维护两套 HTML 源码；为搜索引擎生成 `/` 和 `/zh/` 两个可抓取 URL 更合适。
- 保留单 URL 运行时切换会让中文页面依赖 JavaScript，语言 canonical 和搜索入口不够稳定，因此不作为最终方案。

## AI 的重要假设

- 根路径 `/` 作为英文版本，`/zh/` 作为简体中文版本。
- GitHub Pages 仍使用仓库子路径和 Vite 相对资源基址。
- 搜索排名、收录和外部链接效果需要发布后由维护者通过 Search Console/Bing Webmaster 验证。

## 方案和执行摘要

- 先执行 Git 暂存区门禁和文档归档检查；归档检查结果为 `NOT_DUE`。
- 更新推广站设计文档、活动实施计划和本协作记录。
- 使用 Vue SSR 在构建阶段将同一套 App 和 content 预渲染到两个语言 HTML。
- 增加语言路径、SEO 元数据、hreflang、JSON-LD、robots、sitemap 和目标关键词正文。

## 验证结果

已通过 `pnpm --filter @cyber-ai-forge/website build`、`pnpm lint`、`pnpm format:check` 和 `pnpm docs:archive:check:ci`。产物包含 `/index.html`、`/zh/index.html`、预渲染正文、语言元数据、JSON-LD、robots 和 sitemap；JSON-LD 可解析，中文关键词与相对资源路径检查通过。

## 未决问题与下一步

- 已创建最终 Git 提交并验证 AI trailer。
- 需要维护者在发布后人工验收语言切换、布局、无 JavaScript 页面和 Search Console 收录。

## 相关设计、ADR、计划和提交

- [开源推广站设计](../../../../design/marketing-site.md)
- [实施计划](../../../../archive/plans/2026-08-10-website-seo.md)
- [ADR-0037](../../../../decisions/ADR-0037-static-marketing-site.md)
- 提交：`feat(website): improve bilingual SEO`
