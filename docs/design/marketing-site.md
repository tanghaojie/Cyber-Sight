---
title: Cyber AI Forge 开源推广站
status: accepted
owner: project maintainers
updated: 2026-08-10
---

# Cyber AI Forge 开源推广站

## 背景与目标

Cyber AI Forge 需要一个部署到 GitHub Pages 的静态推广站，把仓库 README 中的定位、能力、界面预览、技术架构和启动方式组织成适合浏览与分享的单页体验。页面首先解释“为什么不是让 AI 从零搭建”，再用产品界面和工程结构建立可信度，最终引导访问 GitHub。

## 范围与非目标

范围包括独立静态站应用、运行时中英文切换、固定毛玻璃 Header、页内锚点、滚动驱动的三维界面轮播、响应式布局、可访问性降级、SEO 元数据和 GitHub Pages 自动部署。

不接入后端、数据库、登录态或管理端运行时模块；不复用管理端私有组件；不在推广站展示动态生产数据；不创建前端自动化或浏览器测试。界面展示使用由静态 HTML/CSS 构成的产品场景，避免依赖需要维护的远程截图服务，后续可用真实压缩截图替换场景内容而不改变轮播结构。

## 职责与边界

- `apps/website` 是独立 Vite + Vue 3 静态应用，只负责公开推广内容。
- 推广站仅通过公开 GitHub URL、仓库内品牌资产和构建时源文件了解主项目，不导入 `apps/frontend` 的内部组件、状态或 API。
- `.github/workflows/deploy-pages.yml` 只构建和发布 `apps/website/dist`，不部署管理端或后端。
- 根工作区命令通过 pnpm workspace 自动发现推广站，并把它纳入统一格式、Lint 和构建验证。

## 公共接口

- 页面锚点：`#showcase`、`#features`、`#system`、`#start`。
- GitHub 入口：`https://github.com/tanghaojie/Cyber-AI-Forge`。
- 语言 URL 参数：`?lang=zh` 或 `?lang=en`；偏好存入 `cyber_ai_forge_site_locale:v1`。
- 语言切换必须位于 Header，不在 Footer 重复放置交互入口。

## 视觉与交互系统

页面采用“Forge Blueprint / 工业编辑式系统蓝图”方向：石墨黑为主体、暖白承载长文本、薄荷绿表示结构和可执行动作、电紫表示智能节点。大字号紧缩标题与等宽标签形成技术出版物气质，网格、刻度、节点和环形轨道表达模块边界与受控数据流。

桌面端界面展示区使用自然页面滚动计算三维环形旋转进度，不拦截滚轮。按钮和键盘可以直接选择场景。窄屏、触控优先环境和 `prefers-reduced-motion` 用户降级为水平 `scroll-snap` 列表；所有动效只改变 `transform` 与 `opacity`。

## 数据模型与数据流

中英文内容保存在站点本地 TypeScript 资源中：

```text
URL lang / localStorage / browser language
    -> locale state
    -> document lang + title + description
    -> header、章节、场景说明与 CTA
```

滚动数据流：

```text
passive scroll event
    -> requestAnimationFrame
    -> showcase section progress
    -> active scene + CSS 3D ring transform
```

## 依赖关系

站点依赖 Vue 3、Vite、TypeScript 与 `@vitejs/plugin-vue`。不增加动画、三维、组件库或国际化运行时依赖；动效与本地化由浏览器 API 和 Vue 状态完成，以控制 GitHub Pages 资源体积。

## 失败模式与安全考虑

- GitHub Pages 子路径变化：Vite 使用相对资源基址，避免仓库名变化导致静态资源 404。
- JavaScript 禁用：首屏仍保留默认英文文案和 GitHub 链接，但语言切换与轮播增强不可用。
- 过度动效：不得阻止原生滚动；减少动效设置下取消平滑滚动、视差和三维旋转。
- 外部字体不可达：提供紧缩无衬线、中文无衬线和等宽系统回退栈。
- 外部链接使用安全的 `rel="noreferrer"`，所有交互具备键盘焦点和可读标签。

## 测试与验证策略

- 执行 `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm build` 和 `pnpm docs:archive:check:ci`。
- 检查生成的 `apps/website/dist` 包含入口、品牌图标和相对静态资源。
- 维护者人工验收 375、768、1024 和 1440 像素宽度下的 Header、语言切换、锚点、三维轮播、键盘操作、减少动效模式和 GitHub 跳转；自动检查不能替代该人工验收。

2026-08-10 已完成 `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm build` 和 `pnpm docs:archive:check:ci`；推广站 Vue TypeScript 检查与生产构建、主应用和契约/后端构建均通过。推广站产物包含相对路径入口、品牌图标与分享图，JavaScript 和 CSS 合计 gzip 后约 49 KB。按照仓库边界未创建或运行前端自动化/浏览器测试；上述桌面、窄屏、语言切换、三维滚动、键盘与减少动效场景仍需维护者人工验收。

## 兼容性与迁移

推广站是新增应用，不改变管理端、后端、数据库或 API 契约。GitHub Pages 工作流首次启用后，仓库需要在 GitHub Pages 设置中选择 GitHub Actions 作为来源；删除工作流和站点应用即可回滚，不影响主系统。

## 未决问题

- 首次发布后由维护者确认 GitHub Pages 自定义域名、Repository Pages 路径和真实产品截图更新节奏。

## 相关 ADR、计划和 AI 日志

- [ADR-0037：独立静态应用发布开源推广站](../decisions/ADR-0037-static-marketing-site.md)
- [实施计划](../archive/plans/2026-08-10-marketing-site.md)
- [AI 协作记录](../archive/ai-logs/2026/08/2026-08-10-marketing-site.md)
