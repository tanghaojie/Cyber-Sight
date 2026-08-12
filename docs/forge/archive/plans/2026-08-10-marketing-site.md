---
title: Cyber AI Forge 开源推广站实施计划
status: completed
created: 2026-08-10
updated: 2026-08-10
---

# Cyber AI Forge 开源推广站实施计划

## 目标

交付可由 GitHub Pages 托管的中英文单页推广站，以无滚动劫持的三维环形展示、清晰价值叙事和 GitHub CTA 推广 Cyber AI Forge。

## 背景与设计依据

依据[推广站设计](../../design/marketing-site.md)、[品牌视觉系统](../../design/branding.md)和 [ADR-0037](../../decisions/ADR-0037-static-marketing-site.md)。视觉方案参考 `ui-ux-pro-max` 的暗色开发者工具落地页、宽松密度、功能展示与可访问动效建议，并由 `frontend-design` 收敛为工业编辑式系统蓝图。

## 范围

- 新增独立 `apps/website` 静态应用。
- 实现 Header 语言切换、锚点导航、GitHub CTA 和移动端菜单。
- 实现双语内容、滚动三维环形界面展示、核心亮点、工作流、架构、启动方式和边界说明。
- 增加 GitHub Pages 部署工作流并同步仓库文档。

## 非目标

- 不修改管理端业务行为、API、数据库或现有运行时多语言模块。
- 不创建前端自动化测试或浏览器测试。
- 不自动开启仓库 Pages 设置或推送远程分支。

## 前置条件和风险

- 暂存区门禁和归档审计已通过，任务开始时工作区干净。
- 仓库尚无真实界面截图资产，首版使用静态 HTML/CSS 产品场景；真实截图可后续替换。
- GitHub Pages 需要维护者在仓库设置中选择 GitHub Actions 来源。

## 实施任务

- [x] 建立设计、ADR、实施计划和 AI 协作记录。
- [x] 创建站点结构、内容资源和品牌资产。
- [x] 完成页面视觉、响应式、双语与交互实现。
- [x] 添加 GitHub Pages 工作流和项目文档入口。
- [x] 执行格式、Lint、构建与文档归档验证。
- [x] 复核最终 diff，归档计划和协作记录并创建 AI 标记提交。

## 测试与验证

运行 `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm build` 和 `pnpm docs:archive:check:ci`。前端实际视觉和浏览器行为由维护者人工验收，重点覆盖 Header 语言切换、自然滚动轮播、移动端降级、键盘与减少动效模式。

实际结果：格式化、格式检查、Lint、全仓生产构建和文档归档 CI 检查均通过；按照仓库边界未创建或运行前端自动化/浏览器测试。

## 发布与回滚

合并到默认分支后由 GitHub Actions 构建和发布。发布失败时保留现有 Pages 版本；删除或禁用部署工作流即可停止后续发布，站点应用不会影响主系统。

## 实际偏差和遗留问题

- 仓库没有真实产品截图资产，按计划使用六组静态 HTML/CSS 产品场景；场景分别对应工作台、用户、授权、动态导航、运行时契约和项目文档，后续可在保持轮播结构的前提下替换为真实压缩截图。
- `pnpm install --lockfile-only` 首次访问 npm 元数据出现网络超时，但最终成功解析并写入新 workspace importer；后续使用锁文件离线链接 695 个已有缓存包，没有下载新包。
- `ui-ux-pro-max` 的最终专业清单促使触控区统一到至少 44 像素、加入安全区、取消无限装饰旋转、隐藏预览内伪交互焦点，并保留键盘、跳转正文和减少动效降级。
- `pnpm lint` 与 `pnpm build` 已通过；推广站产物 JavaScript 98.25 kB、CSS 40.75 kB，合计 gzip 后约 49 kB。管理端既有 Sass 与 Rollup 提示未影响构建，且不属于本任务引入问题。
- 未运行前端浏览器自动化测试；375、768、1024、1440 像素、横屏、语言切换、轮播和减少动效仍由维护者人工验收。

## 相关设计、ADR 和 AI 日志

- [推广站设计](../../design/marketing-site.md)
- [ADR-0037](../../decisions/ADR-0037-static-marketing-site.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-10-marketing-site.md)
