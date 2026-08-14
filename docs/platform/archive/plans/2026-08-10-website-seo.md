---
title: 官网中英文静态入口与 SEO 增强
status: completed
created: 2026-08-10
updated: 2026-08-10
---

# 官网中英文静态入口与 SEO 增强

## 目标

在不维护两套 Vue 页面逻辑的前提下，为 `apps/website` 生成英文 `/` 和中文 `/zh/` 两个静态入口，提升中英文搜索引擎抓取、分享和关键词匹配能力。

## 背景与设计依据

- 当前站点只有一个 Vite/Vue 应用，语言切换依赖运行时 JavaScript、查询参数和本地存储。
- 当前英文 title/H1 偏品牌口号，网站正文对 `AI development scaffold`、`admin dashboard scaffold`、`AI 开发脚手架` 和 `后台管理系统脚手架` 覆盖不足。
- 采用单一 Vue 源码、单一内容资源和构建时 Vue SSR 预渲染，避免手工维护两份页面。
- 语言页面使用独立 URL、canonical、hreflang 和真实链接；GitHub Pages 继续作为静态部署目标。

## 范围

- 新增 `/zh/` Vite HTML 入口与 SSR 预渲染构建步骤。
- 让 App 通过 URL 路径确定 locale，语言切换改为可抓取链接。
- 增强中英文 title、description、H1、首屏和能力文案。
- 增加 canonical、hreflang、Open Graph/Twitter 元数据和 SoftwareApplication/WebSite JSON-LD。
- 增加 `robots.txt`、`sitemap.xml`，并保留现有 SVG 社交分享图。
- 更新推广站设计文档与 AI 协作记录。

## 非目标

- 不拆分两套 Vue 组件、样式或业务逻辑。
- 不新增后台 API、数据库、用户行为追踪或内容管理系统。
- 不创建前端自动化测试或浏览器测试；页面视觉和交互仍由维护者人工验收。

## 前置条件和风险

- `@vue/server-renderer` 必须与当前 Vue 主版本兼容。
- GitHub Pages 子路径必须继续使用相对资源路径。
- 预渲染输出必须在 hydration 后保持 DOM 结构一致，避免客户端接管时出现水合警告。
- 搜索排名和收录不能由代码验证保证，需要发布后通过 Search Console/Bing Webmaster 观察。

## 实施任务

- [x] 完成暂存区门禁和 `pnpm docs:archive:check`。
- [x] 更新推广站设计、实施计划和 AI 协作记录。
- [x] 实现双语言 Vite 入口与 Vue SSR 预渲染。
- [x] 实现语言 URL、元数据、hreflang、结构化数据、robots 和 sitemap。
- [x] 优化中英文 SEO 文案、正文语义并保留现有 SVG 分享图。
- [x] 执行格式、构建、Lint、归档 CI 检查并审阅最终 diff。
- [x] 提交验证通过的本轮改动并校验 AI trailer。

## 测试与验证

- `pnpm format`：通过；范围外人类文章临时忽略后恢复原 `.prettierignore`。
- `pnpm format:check`：通过；使用同一范围保护。
- `pnpm lint`：通过。
- `pnpm --filter @cyber-ai-forge/website build`：通过，生成根路径和 `/zh/` 预渲染 HTML。
- `pnpm docs:archive:check:ci`：通过，结果为 `NOT_DUE`。
- 产物检查：两个 HTML 均包含可见 `<h1>`/正文、语言级 canonical/hreflang、有效 JSON-LD；中文关键词存在；相对资源路径正确；robots 指向 sitemap，sitemap 包含 2 个语言 URL。
- 关联提交：`feat(website): improve bilingual SEO`。
- 检查 `dist/index.html` 和 `dist/zh/index.html` 的可见预渲染正文、语言、canonical、hreflang、JSON-LD、Open Graph 和相对资源。

## 发布与回滚

发布沿用 `.github/workflows/deploy-pages.yml`。若预渲染构建失败，可回滚构建脚本和新增 SEO 资源，恢复原有单入口运行时站点；不影响管理端、后端、数据库或 API。

## 实际偏差和遗留问题

本次保留现有 SVG 分享图，没有新增 PNG 转码资产；后续根据社交平台抓取结果决定是否补充 PNG。收录、排名、Search Console 数据和浏览器人工验收结果不属于本地构建可证明范围。

## 相关设计、ADR 和 AI 日志

- [开源推广站设计](../../design/marketing-site.md)
- [ADR-0037：独立静态应用发布开源推广站](../../decisions/ADR-0037-static-marketing-site.md)
- [AI 协作记录](../../ai-logs/2026/08/2026-08-10-website-seo.md)
