---
title: 统一 Element Plus 弹窗顶部间距
date: 2026-08-05
status: completed
---

# 统一 Element Plus 弹窗顶部间距

## 用户目标和约束

将 Element Plus 默认 Dialog 的 `15vh` 顶部间距统一调整为 `5vh`，并处理项目中的全部弹窗。

## 关键问答与确认

已确认项目通过 `apps/frontend/src/styles/element-plus/el-dialog-override.scss` 集中覆盖 Element Plus Dialog 样式；源码中没有其他 `15vh` 或 `--el-dialog-margin-top` 设置。

## AI 的重要假设

将 Element Plus 提供的 `--el-dialog-margin-top` 设在全局 Dialog 选择器上，能覆盖所有未局部重写该变量的现有和后续 `el-dialog`，符合“统一处理”的目标。

## 方案和执行摘要

在全局 Dialog 覆盖层声明 `--el-dialog-margin-top: 5vh`，不逐个业务模块添加重复配置，并更新前端设计说明。

## 验证结果

`pnpm format`、`pnpm format:check` 和 `pnpm -F @scaffold/frontend run build` 均通过；后者包含 Vue TypeScript 检查与 Vite 生产构建。源码扫描仅保留新的全局 `--el-dialog-margin-top: 5vh` 声明。构建仅产生既有 Sass 弃用和动态/静态导入分包提示。

## 未决问题与下一步

维护者需在实际浏览器中人工确认不同高度视口下各弹窗的视觉位置；前端自动化浏览器测试不在本项目维护范围内。

## 相关设计、ADR、计划和提交

- [前端应用与应用壳](../../../../design/modules/frontend.md)
- [实施计划](../../../../archive/plans/2026-08-05-dialog-top-margin.md)
- 提交：待创建。
