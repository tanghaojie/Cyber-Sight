---
title: Cyber-Sight 推广站
status: archived
owner: project maintainers
updated: 2026-08-11
archived: 2026-08-14
---

# Cyber-Sight 推广站

## 背景与目标

Cyber-Sight 需要一个部署到 GitHub Pages 的静态推广站，把产品身份、继承的 Cyber AI Forge 工程基线、界面预览、技术架构和启动方式组织成适合浏览与分享的单页体验。页面首先说明 Cyber-Sight 是独立下游产品，再用产品界面和工程结构建立可信度，最终引导访问 Cyber-Sight GitHub 仓库。

## 范围与非目标

范围包括独立静态站应用、运行时中英文切换、固定毛玻璃 Header、页内锚点、滚动驱动的三维界面轮播、响应式布局、可访问性降级、SEO 元数据和 GitHub Pages 自动部署。

不接入后端、数据库、登录态或管理端运行时模块；不复用管理端私有组件；不在推广站展示动态生产数据；不创建前端自动化或浏览器测试。界面展示使用维护者提供并随站点发布的真实产品截图，不依赖远程截图服务；截图只作为公开展示资产，不建立对管理端内部组件的运行时依赖。

## 职责与边界

- `apps/website` 是独立 Vite + Vue 3 静态应用，只负责公开推广内容。
- 推广站仅通过公开 GitHub URL、仓库内品牌资产和构建时源文件了解主项目，不导入 `apps/frontend` 的内部组件、状态或 API。
- `.github/workflows/deploy-pages.yml` 只构建和发布 `apps/website/dist`，不部署管理端或后端。
- 根工作区命令通过 pnpm workspace 自动发现推广站，并把它纳入统一格式、Lint 和构建验证。

## 公共接口

- 页面锚点：`#showcase`、`#features`、`#system`、`#start`。
- GitHub 入口：`https://github.com/tanghaojie/Cyber-Sight`。
- 语言 URL：根路径 `/` 提供英文版本，`/zh/` 提供简体中文版本；语言切换使用真实链接。
- 语言切换位于 Header，以具备明确选中状态的紧凑分段控件呈现，不在 Footer 重复放置交互入口。

## 视觉与交互系统

页面采用“Forge Blueprint / 工业编辑式系统蓝图”方向：石墨黑为主体、暖白承载长文本、薄荷绿表示结构和可执行动作、电紫表示智能节点。大字号紧缩标题与等宽标签形成技术出版物气质，网格、刻度、节点和环形轨道表达模块边界与受控数据流。

桌面端界面展示区使用自然页面滚动计算三维环形旋转进度，不拦截滚轮。轮播卡片直接展示 16:9 产品截图，并通过 `object-fit: cover` 保持画面比例。按钮和键盘可以直接选择场景。窄屏、触控优先环境和 `prefers-reduced-motion` 用户降级为水平 `scroll-snap` 列表；所有动效只改变 `transform` 与 `opacity`。

核心体系使用无断层的十二列网格：桌面端每一行的卡片跨度总和必须等于十二，避免 CSS Grid 自动换行产生不可解释的空白；中窄屏统一切换为双列或单列。

## 数据模型与数据流

中英文内容保存在站点本地 TypeScript 资源中，构建时以同一套 Vue 源码生成两个语言入口：

```text
content.ts
    -> Vite client bundle
    -> Vue SSR pre-render
    -> /index.html 与 /zh/index.html
    -> hydration + locale-specific metadata
```

双语数组中同一位置的条目表示同一个页面实体。带进入动画的重复组件必须使用与语言无关的稳定 `key`，确保切换语言只更新文本，不销毁已经通过显现观察器激活的 DOM 节点。

滚动数据流：

```text
passive scroll event
    -> requestAnimationFrame
    -> showcase section progress
    -> active scene + CSS 3D ring transform
```

## 依赖关系

站点依赖 Vue 3、Vite、TypeScript、`@vitejs/plugin-vue` 与 `@vue/server-renderer`。不增加动画、三维、组件库或国际化运行时依赖；动效与本地化由浏览器 API 和 Vue 状态完成，预渲染只在构建阶段运行，以控制 GitHub Pages 资源体积。

## 失败模式与安全考虑

- GitHub Pages 子路径变化：Vite 使用相对资源基址，避免仓库名变化导致静态资源 404。
- JavaScript 禁用：预渲染后的语言页面仍保留完整首屏内容、导航、产品说明和 GitHub 链接；语言切换与轮播增强不可用。
- 过度动效：不得阻止原生滚动；减少动效设置下取消平滑滚动、视差和三维旋转。
- 外部字体不可达：提供紧缩无衬线、中文无衬线和等宽系统回退栈。
- 外部链接使用安全的 `rel="noreferrer"`，所有交互具备键盘焦点和可读标签。
- 产品截图包含管理端示例数据，发布前由维护者确认其中不含令牌、真实个人信息或生产数据。
- 本地化内容不得作为带显现动画节点的组件身份；否则切换语言可能重建节点并使其停留在隐藏初始态。

## SEO 与多语言交付

- 保持单一 Vue 源码和单一 `content.ts`，构建时生成 `/` 与 `/zh/` 两个静态 HTML，不维护两套页面逻辑。
- 每个语言页面拥有独立的 `title`、description、canonical、Open Graph、Twitter Card 和 JSON-LD；页面互相通过 `hreflang` 与 Header 真实链接关联。
- SEO 首屏使用 `Cyber-Sight`、`AI-native business application`、`AI 原生业务应用` 和 `built on Cyber AI Forge` 等准确定位，并以自然正文解释继承的认证、用户、角色、权限、菜单、日志和 Vue/NestJS/PostgreSQL 技术栈；不得把 Cyber-Sight 自称为可复用脚手架。
- `robots.txt` 声明 sitemap，`sitemap.xml` 只列出可收录的语言规范 URL；分享图继续复用仓库内 SVG 资产，后续可根据社交平台抓取结果补充 PNG 版本。
- 预渲染 HTML 是爬虫和无 JavaScript 客户端的内容基线，客户端 hydration 只负责交互增强，不负责首次生成主要文案。

## 测试与验证策略

- 执行 `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm build` 和 `pnpm docs:archive:check:ci`。
- 检查生成的 `apps/website/dist` 包含 `/index.html`、`/zh/index.html`、`robots.txt`、`sitemap.xml`、品牌图标、分享图、可见预渲染正文和相对静态资源。
- 检查两种 HTML 的语言、title、description、canonical、hreflang、结构化数据和语言切换链接；使用 Search Console 人工检查收录状态与实际搜索词。
- 维护者人工验收 375、768、1024 和 1440 像素宽度下的 Header、语言切换、锚点、三维轮播、键盘操作、减少动效模式和 GitHub 跳转；自动检查不能替代该人工验收。

2026-08-10 已完成 `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm build` 和 `pnpm docs:archive:check:ci`；推广站 Vue TypeScript 检查与生产构建、主应用和契约/后端构建均通过。推广站产物包含相对路径入口、品牌图标与分享图，JavaScript 和 CSS 合计 gzip 后约 49 KB。按照仓库边界未创建或运行前端自动化/浏览器测试；上述桌面、窄屏、语言切换、三维滚动、键盘与减少动效场景仍需维护者人工验收。

2026-08-10 的视觉优化使用维护者提供的六张 PNG 替换合成产品场景，并完成语言切换与核心卡片网格修正。格式检查、全仓 Lint、生产构建和文档归档 CI 检查通过，Vite 为六张截图生成带哈希的 Pages 资源；截图总计约 3.1 MB。浏览器视觉与交互仍需维护者人工验收。

2026-08-10 已修复核心卡片以本地化文案作为 Vue `key` 导致的语言切换后隐藏问题；卡片改用稳定位置身份，Lint 与生产构建通过。

2026-08-10 已完成中英文 SEO 增强：推广站保留单一 Vue 源码，构建时生成 `/` 与 `/zh/` 两个带完整预渲染正文的静态入口；两个入口均包含语言级 canonical、hreflang、Open Graph、Twitter Card、JSON-LD、robots 和 sitemap。首屏文案补充 AI 开发脚手架、后台管理脚手架及认证、权限、用户、角色、菜单、日志和技术栈语义。最终验证通过 website 生产构建、全仓 Lint、格式检查和文档归档 CI；Search Console 收录、排名和浏览器人工验收仍需发布后完成。

2026-08-11 已把推广站当前产品身份迁移为 Cyber-Sight，并保留 `Built on Cyber AI Forge` 工程归属。中英文 title、description、canonical、hreflang、Open Graph、Twitter Card、JSON-LD、robots、sitemap、GitHub URL、图标标题和分享图均已同步；公开统计已按当前实现校准为 17 张系统数据表和 140 项后端测试。生产构建及生成 HTML 静态检查通过，浏览器视觉、交互和发布后收录仍由维护者人工验收。

## 兼容性与迁移

推广站不改变管理端、后端、数据库或 API 契约。GitHub Pages 使用 Cyber-Sight 仓库路径；仓库需要在 GitHub Pages 设置中选择 GitHub Actions 作为来源。删除工作流和站点应用即可回滚，不影响主系统。

## 未决问题

- 首次发布后由维护者确认 GitHub Pages 自定义域名、Repository Pages 路径和产品截图更新节奏。

## 相关 ADR、计划和 AI 日志

- [ADR-0037：独立静态应用发布开源推广站](../decisions/ADR-0037-static-marketing-site.md)
- [原始实施计划](../plans/2026-08-10-marketing-site.md)
- [视觉优化计划](../plans/2026-08-10-marketing-site-visual-refinement.md)
- [核心卡片语言切换显现修复](../plans/2026-08-10-feature-locale-reveal.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-10-marketing-site-visual-refinement.md)
- [中英文静态入口与 SEO 增强计划](../plans/2026-08-10-website-seo.md)
- [中英文静态入口与 SEO 增强 AI 协作记录](../ai-logs/2026/08/2026-08-10-website-seo.md)
