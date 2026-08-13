---
title: 主题颜色与深色模式
status: completed
owner: maintainers
date: 2026-08-04
---

# 主题颜色与深色模式实施计划

## 目标

将系统设置中已持久化但未生效的主题颜色与深色模式接入整个前端应用壳，并把主题色扩展为六种已确认方案。

## 实施步骤

1. 扩展设置主题枚举，兼容既有四种存储值并保留其他设备级偏好。
2. 在设置模块提供应用根主题控制器，向 `html` 写入主题标识、深色类名和浏览器颜色方案。
3. 将全局、Element Plus、管理页面和设置弹窗的颜色令牌改为响应主题与深色模式。
4. 更新设置弹窗的六色预览和中英文文案。
5. 已运行格式化、静态检查、TypeScript 检查和生产构建；归档计划与 AI 记录。

## 验收

- 六种主题色在设置弹窗内可选择，选择后即时影响应用主色并刷新后恢复。
- 深色模式可即时切换，应用壳、基础页面、Element Plus 表面和设置弹窗保持可读。
- 旧版主题设置在恢复时映射至语义最接近的新主题，不丢失其余有效偏好。

## 实际结果

- 新增应用根 ThemeController，通过 `html[data-theme]`、`html.dark` 和 `color-scheme` 即时驱动 CSS 与 Element Plus。
- 设置弹窗改为六个已确认色板；旧版 `aurora`、`ocean`、`violet`、`sunset` 设置分别映射至 `jade`、`azure`、`violet`、`amber`。
- `pnpm format`、`pnpm format:check`、`pnpm lint` 和 `pnpm build` 均通过。生产构建保留既有的静态/动态导入分包提示与 Sass legacy API 弃用提示；未运行前端自动化或浏览器测试，需由维护者人工验收切换效果。
