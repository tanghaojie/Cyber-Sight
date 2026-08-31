---
title: Geo 时间轴插件贡献响应性修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-31
updated: 2026-08-31
---

# Geo 时间轴插件贡献响应性修复

## 目标

恢复 Geo 工作台底部 UTC 时间轴的正常显示，并保证所有在工作台首次渲染后发布或移除的插件 UI 贡献都会同步更新。

## 背景与设计依据

时间插件已正常安装且注册了 `bottomDocks` contribution，但注册表用普通数组保存贡献。工作台根元素在插件安装前读取了底部 dock 列表，Vue 因而缓存空结果，之后的注册不会触发重算。这与 [Geo 前端空间可视化工作台](../../design/modules/geo.md) 中由 Shell 渲染注册表贡献的约定不符。

## 范围

- 将 Geo 插件注册表的贡献列表改为浅响应式集合；
- 验证时间插件在首次进入 Geo 页面后显示，且没有新增插件错误；
- 更新当前设计、计划和 AI 协作记录。

## 非目标

- 不改变 `viewer.clock`、UTC 时间范围、播放逻辑、太阳光照或阴影行为；
- 不更改底部 dock 的布局、尺寸或宽屏支持基线；
- 不新增前端自动化测试。

## 前置条件和风险

- 仅让集合长度和条目变化被 Vue 跟踪，贡献对象及 Vue 组件定义必须保持原样，避免被深度代理；
- 仍按 Geo 模块的人工浏览器验收边界确认可见性和交互。

## 实施任务

- [x] 在本地 Geo 页面复现时间轴缺失，并确认时间插件未报告安装错误。
- [x] 将插件贡献集合改为浅响应式发布源。
- [x] 完成静态检查、生产构建和人工浏览器验收。
- [x] 更新最终结果并归档计划与协作记录。

## 测试与验证

- `pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`pnpm docs:archive:check:ci`、`git diff --check` 与前端生产构建；
- 本地进入 `/geo`，确认底部时间轴显示、播放/暂停可操作、状态栏收起后仍避让展开按钮，且没有插件错误或控制台错误。

## 发布与回滚

该修复只调整内部贡献集合的响应性；如有意外，可回滚本次单一提交恢复此前集合实现。

## 实际偏差和遗留问题

- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`git diff --check` 和授权环境的 `pnpm --filter @cyber-ai-forge/frontend build` 通过；
- 本地 `/geo` 初始加载后可见“仿真时间轴”，播放会切换为暂停状态，状态栏收起后时间轴仍可见并避让“展开状态栏”入口；
- 浏览器控制台和插件错误面板均无错误；
- 生产构建保留既有 Sass legacy API 与 Rollup `#__PURE__` 注释警告，本轮未新增警告。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 前端编译期插件架构](../../decisions/ADR-20260814-geo-frontend-plugin-architecture.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-31-geo-timeline-reactivity.md)
- 关联提交：本次 `fix(geo): restore reactive timeline dock`
