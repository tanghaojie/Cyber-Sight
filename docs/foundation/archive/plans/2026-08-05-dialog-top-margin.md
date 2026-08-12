---
title: 统一 Element Plus 弹窗顶部间距
status: completed
created: 2026-08-05
updated: 2026-08-05
---

# 统一 Element Plus 弹窗顶部间距

## 目标

将所有 Element Plus `el-dialog` 的默认顶部间距从 `15vh` 统一调整为 `5vh`。

## 背景与设计依据

Element Plus 将 Dialog 顶部间距暴露为 `--el-dialog-margin-top`，当前全局覆盖层未设置该变量，因而使用组件默认的 `15vh`。在全局 Dialog 覆盖层设置变量可覆盖全部现有和后续未局部覆盖的弹窗，而无需逐个模块重复配置。

## 范围

- 更新前端 Element Plus Dialog 全局样式覆盖。
- 更新前端应用与应用壳设计，记录统一的间距规则。

## 非目标

- 不修改弹窗宽度、底部外边距、内容间距或移动端布局。
- 不为各业务模块新增局部 `top` 配置。

## 前置条件和风险

全局变量会影响所有未显式覆盖该变量的 `el-dialog`；这是用户要求的统一行为。需要由维护者人工确认不同屏幕高度下的视觉效果。

## 实施任务

- [x] 定位 Element Plus Dialog 全局覆盖及项目中的局部间距配置。
- [x] 将全局 `--el-dialog-margin-top` 设为 `5vh`。
- [x] 同步前端设计说明。
- [x] 执行格式、静态检查和生产构建。
- [x] 记录验证结果并归档计划与 AI 协作记录。

## 测试与验证

- `pnpm format` 和 `pnpm format:check` 均通过。
- `pnpm -F @scaffold/frontend run build` 通过，包含 Vue TypeScript 检查和 Vite 生产构建。
- 已确认源码中不存在其他 `15vh` 或 `el-dialog-margin-top` 覆盖。
- 前端弹窗视觉与交互由维护者人工验收。

## 发布与回滚

前端静态样式改动随常规前端发布生效。若需回滚，只需移除全局变量声明，恢复 Element Plus 默认顶部间距。

## 实际偏差和遗留问题

无实现偏差。生产构建输出既有的 Sass legacy JS API 弃用提示，以及 `AdminLayout.vue` 和 `HomePage.vue` 同时被静态与动态导入的分包提示，均未阻止构建。

## 相关设计、ADR 和 AI 日志

- [前端应用与应用壳](../../design/modules/frontend.md)
- [模块边界](../../design/module-boundaries.md)
- [AI 协作记录](../../archive/ai-logs/2026/08/2026-08-05-dialog-top-margin.md)
