---
title: Geo 可收起状态栏与时间轴底部自适应协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo 可收起状态栏与时间轴底部自适应协作记录

## 用户目标和约束

用户要求修复 Geo 模块底部状态栏，使其可折叠或收起；折叠后不显示信息，并询问刚实现的时间轴能否自适应到底部。

仓库约束要求保持 Geo 宽屏工作台边界，不新增前端自动化测试；非简单交互改动需先同步设计、计划和 AI 协作记录。

## 关键问答与确认

- 当前实现中状态栏固定在 `bottom: 14px`，时间轴容器固定在 `bottom: 74px`，二者没有共享布局状态。
- 时间轴仍通过 `bottomDocks` contribution 注入，布局适配应由页面 Shell 完成，不应修改 Time 插件时间语义。

## AI 的重要假设

- 状态栏默认保持展开，不持久化用户选择；
- “折叠后不显示信息”允许保留唯一的展开按钮，否则用户无法恢复状态栏；
- 支持范围仍是横向 `1280×720` 及更宽桌面视口。

## 方案和执行摘要

页面 Shell 持有布尔开合状态并传给通用状态栏。状态栏展开时显示原有信息和收起按钮，收起时只渲染展开按钮。Shell 使用 CSS 变量统一调整时间轴和 Cesium credits 的底部占位，Time 插件保持不变。按钮补充中英文可访问名称、键盘焦点和 reduced-motion 行为。

## 验证结果

- `pnpm format`：通过；
- `pnpm format:check`：通过；
- `pnpm lint`：通过；
- `pnpm architecture:check`：通过；
- `git diff --check`：通过；
- `pnpm --filter @cyber-ai-forge/frontend build`：沙箱内因 Windows 目录读取权限失败，授权环境原样重跑后 `vue-tsc` 与 Vite 生产构建通过；
- 生产构建仅有仓库既存的 Sass legacy API、Rollup PURE 注释、动态/静态重复导入和 Geo 大 chunk 警告；
- 按仓库边界未运行前端自动化或浏览器测试，人工验收项保留在实施计划。

## 未决问题与下一步

维护者仍需在真实 Geo 页面人工确认展开/收起视觉层级、时间轴拖动、展开按钮点击区域和 Cesium credits 避让。

## 相关设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../../design/modules/geo.md)
- [Geo 单一仿真时间与太阳光照](../../../../decisions/ADR-20260830-geo-simulation-time-and-solar-lighting.md)
- [实施计划](../../../plans/2026-08-31-geo-collapsible-status-bar.md)
- 关联提交：本轮 `fix(geo): add collapsible status bar` AI 自动提交。
