---
title: Geo 分镜相机距离与端点定位
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-19
updated: 2026-10-19
---

# Geo 分镜相机距离与端点定位

## 目标与范围

解决模板分镜相机过远时只能编辑三维坐标的问题，在当前编辑器增加起终点相机距离（米），并为每个分镜卡片和编辑器增加起终点视角定位按钮。仅修改 Platform Geo 拍摄插件及内部工具；不修改模板默认距离、工程版本、依赖、后端或 Foundation。

## 背景与设计依据

遵循 [拍摄模块设计](../../design/modules/geo-capture.md) 和 [统一拍摄进度 ADR](../../decisions/ADR-20261019-geo-capture.md)。任务开始时暂存区与工作区均为空；归档审计为 Platform NOT_DUE，无同事项活动计划。

## 实施任务

- [x] 以既有机位坐标派生距离，沿原视线移动相机并复用工程校验和保存。
- [x] 分镜卡片与当前编辑器提供端点定位，使用同一求值和可恢复会话。
- [x] 显式定位镜头 ID，正确处理环绕、固定机位及非末尾镜头的终点边界。
- [x] 完成允许的工程检查、更新最终设计与协作记录；与实现同次归档提交。

## 测试与验证

执行 `pnpm format`、`pnpm format:check`、相关 ESLint、前端 Vue/TypeScript 与生产构建、`pnpm architecture:check`、`pnpm docs:archive:check:ci`、`git diff --check`。遵守仓库边界，不创建或运行前端自动化测试。

人工验收：四类模板的横竖屏拉近/拉远、距离与坐标联动、非零注视点与视场角保持、无效距离拒绝、固定机位仅起点可编辑；各卡片与编辑器定位、环绕实际终点、非末尾镜头边界、昼夜与拼装动画同步、播放中定位暂停、停止/Esc/离开恢复、保存与 JSON 往返、导出期间禁用。

## 风险、发布与回滚

拉近可能裁切或穿入模型，需要人工确认构图；不保证自动避障。随前端构建交付，可回退本轮提交；旧工程无数据迁移。

## 实际偏差和遗留问题

实现与计划一致。相关 ESLint、前端 `build`（含 `vue-tsc`）、`pnpm architecture:check`、`pnpm format:check`、`git diff --check` 均通过；`pnpm format` 已执行，`pnpm docs:archive:check:ci` 为 NOT_DUE。构建报告 Sass legacy API、VueUse 注释及大包提示，无构建错误。

浏览器视觉及交互由维护者人工验收；不将静态检查视为实际相机、场景动画或视频输出验收。本轮未创建或运行前端自动化测试。

## 相关记录与提交

[AI 协作记录](../ai-logs/feat/2026/10/2026-10-19-geo-capture-shot-views.md)。实现、最终设计及本记录同次提交，主题为 `feat(geo): add shot distance and endpoint controls`，父提交为 `e682a6c`。
