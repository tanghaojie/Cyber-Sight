---
title: Geo 模拟飞机本地 SVG 图标
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-31
updated: 2026-08-31
---

# Geo 模拟飞机本地 SVG 图标

## 目标

修复 Cesium 无法加载运行时内联 SVG data URI 的问题，让模拟飞机稳定显示为随前端构建发布的本地 SVG 图标。

## 范围

- 新增 Geo Flight 专属本地飞机 SVG 静态资源；
- 通过 Vite `public` 目录发布的静态 URL 提供给 Cesium billboard；
- 保持完整航线、单一时间轴和离线模拟边界；
- 同步当前设计、ADR、协作记录和人工验收项。

## 非目标

- 不使用网络图片、后端、第三方图标库或新的运行依赖；
- 不改动航线、位置插值或时间轴控制；
- 不运行前端自动化或浏览器测试。

## 实施任务

- [x] 将运行时 data URI 替换为本地 SVG 构建资源；
- [x] 验证前端构建、静态门禁并进行人工验收交接。

## 验证与人工验收

- 授权环境下的前端生产构建与 lint 通过；构建产物实际包含 `dist/geo/aircraft.svg`，长度为 274 字节；
- `pnpm format:check`、`pnpm architecture:check` 和 `git diff --check` 通过；
- 前端自动化与浏览器测试依仓库规则未运行。维护者需确认启用模拟航班后，飞机图标正常显示，且开发、生产环境的 `/geo/aircraft.svg` 返回有效 SVG。
