---
title: Geo 时间轴插件贡献响应性修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo 时间轴插件贡献响应性修复

## 用户目标和约束

修复 Geo 时间轴消失问题。遵守 Platform Geo 模块边界、前端人工浏览器验收边界和完成后自动提交要求。

## 关键问答与确认

- 修改前暂存区为空，Platform 归档审计为 `NOT_DUE`；
- 用户要求修复显示问题，未授权扩大时间、光照或布局范围。

## AI 的重要假设

插件已安装且没有局部错误时，时间轴缺失应由 Shell 到注册表的数据更新链路造成；使贡献集合浅响应式可保留组件定义原样并恢复该链路。

## 方案和执行摘要

- 在本地 `/geo` 复现：地图、任务轨和数据面板正常，底部时间轴缺失，控制台及插件错误面板为空；
- 定位到 `GeoWorkspacePage.vue` 在插件安装前计算 `bottomDocks`，而 `plugin-registry.ts` 的 `contributionList` 是普通数组；
- 将贡献列表改为浅响应式集合，使插件发布/移除触发 Shell 重新计算，同时不深度代理插件自有组件或 controller；
- 更新当前 Geo 设计，明确异步插件完成安装后的 Shell 重渲染契约。

## 验证结果

- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`git diff --check` 和授权前端生产构建通过；
- 本地进入 `/geo` 后，“仿真时间轴”显示播放、当前 UTC、倍速、拖动、太阳光照和太阳阴影控件；播放/暂停状态切换正常；
- 收起状态栏后，时间轴仍显示且“展开状态栏”入口可见；未捕获控制台或插件错误；
- 构建保留既有 Sass legacy API 与 Rollup `#__PURE__` 注释警告，本轮未新增警告。

## 未决问题与下一步

无未决问题。

## 相关设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../../design/modules/geo.md)
- [Geo 前端编译期插件架构](../../../../decisions/ADR-20260814-geo-frontend-plugin-architecture.md)
- [实施计划](../../../plans/2026-08-31-geo-timeline-reactivity.md)
- 关联提交：本次 `fix(geo): restore reactive timeline dock`
