---
title: Geo 外壳精简与指南针交互修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-29
status: completed
---

# Geo 外壳精简与指南针交互修复

## 用户目标和约束

用户要求删除 Geo 模块没有意义的顶栏，并修复右上指南针不反映真实 heading、不能点击回正的问题。

## 关键问答与确认

- 根据现有实现直接确认：顶栏只承载重复文案和无行为按钮；指南针为 `aria-hidden` 的 CSS 装饰。
- 本轮不运行前端自动化或浏览器测试，最终交互由维护者人工验收。

## AI 的重要假设

- “回正”解释为保持相机当前位置和俯仰角，仅把 heading 过渡到正北并清除 roll；不会触发上海初始视图复位。
- 删除顶栏后不在其他位置重放其标题、场景和本地会话文案。

## 方案和执行摘要

- 暂存区硬门禁通过，任务开始时工作区干净；文档归档初审为 `NOT_DUE`。
- 删除 `GeoTopBar`、页面引用和中英文专用文案，并收紧原先为顶栏预留的顶部偏移。
- `GeoRuntime` 在既有 `camera.changed` 监听中同步相机高度与 heading，新增 `orientNorth()` 保持位置和 pitch、归零 heading 与 roll。
- 静态指南针改为带提示、可访问名称和焦点反馈的按钮；北针按 `-heading` 旋转，点击调用独立回正操作。
- 同步 Geo 现行设计并完成计划、AI 日志和归档索引。

## 验证结果

- `pnpm format`、`pnpm format:check`、`pnpm lint` 和 `pnpm architecture:check` 通过。
- 前端 `vue-tsc` 与生产构建通过；沙箱内 Vite/esbuild 命中 Windows 文件访问限制，授权环境原样重跑后通过。
- 修正活动日志中的两个相对链接后，`pnpm docs:archive:check:ci` 通过并返回 `NOT_DUE`。
- 未运行前端自动化或浏览器测试，符合仓库边界。

## 未决问题与下一步

维护者需人工验收真实 Cesium 相机旋转、点击回正，以及桌面和窄屏布局。

## 相关设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../../design/modules/geo.md)
- [实施计划](../../../../archive/plans/2026-08-29-geo-shell-and-compass.md)
- 关联提交：`feat(geo): fix compass interaction`
