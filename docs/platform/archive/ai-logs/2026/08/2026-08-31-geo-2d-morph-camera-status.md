---
title: Geo 2D 场景过渡相机状态修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo 2D 场景过渡相机状态修复

## 用户目标和约束

修复 Geo 模块点击切换到 2D 视图时报错的问题。遵守 Platform Geo 模块边界、前端人工浏览器验收边界和完成后自动提交要求。

## 关键问答与确认

- 用户未要求扩大 2D 功能范围，只修复切换报错；
- 当前暂存区在修改前为空，Platform 归档审计为 `NOT_DUE`。

## AI 的重要假设

Cesium 在场景形态过渡中暂不提供完整相机姿态，使用最近有效朝向或稳定默认值是显示状态的正确降级，不改变最终 2D/3D 相机语义。

## 方案和执行摘要

- 在本地 Geo 页面复现错误，控制台显示 `CesiumMath.toDegrees` 接收未定义弧度，调用栈位于视图插件快照；
- 确认 Cesium 1.144.0 的 Camera 在 `MORPHING` 模式下可返回未定义的 heading、pitch 和 roll；
- 为纯视图工具与页面级指南针状态增加过渡帧保护，并同步当前 Geo 设计。

## 验证结果

- `pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`pnpm docs:archive:check:ci`、`git diff --check` 和授权前端生产构建均通过；
- 在本地 Geo 工作台实际点击右上 2D，再点击返回 3D，浏览器未报告渲染停止、`Runtime.exceptionThrown` 或控制台错误；
- 前端 lint 首次与正在运行的 Vite 开发服务器并行时，因 Vite 临时配置文件被清理而失败；停止服务后重跑通过。生产构建保留既有 Sass、Rollup 和大 Geo chunk 警告。

## 未决问题与下一步

无未决问题。

## 相关设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../../design/modules/geo.md)
- [Geo 前端编译期插件架构](../../../../decisions/ADR-20260814-geo-frontend-plugin-architecture.md)
- [实施计划](../../../plans/2026-08-31-geo-2d-morph-camera-status.md)
- 关联提交：本次 `fix(geo): prevent 2d morph camera errors`
