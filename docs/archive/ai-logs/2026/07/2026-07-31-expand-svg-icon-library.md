---
title: 扩充 SVG 图标库
date: 2026-07-31
status: completed
---

# 扩充 SVG 图标库

## 用户目标和约束

用户要求为项目补充更多 SVG 图标。遵守现有 SVG sprite、前端人工验收和文档归档规则。

## 关键问答与确认

无需额外确认；图标范围限定为管理端常见、可复用的单色图标。

## AI 的重要假设

采用 kebab-case 文件名；每个资产使用 `24 × 24` viewBox 和无硬编码颜色的描边图形，使其继承现有 `AppIcon` 颜色。

## 方案和执行摘要

已确认 Vite 扫描 `src/assets/icons` 并以 `icon-[name]` 注册 symbol，注册表自动生成菜单图标选项。将只新增资产和资产约定，不改动注册逻辑。

## 验证结果

`pnpm format`、`pnpm lint` 与 `pnpm format:check` 成功。受限沙箱中的 `pnpm build` 因 Vite/esbuild 父目录访问限制失败；授权环境原样重跑后，契约、后端和前端生产构建全部成功。构建保留已有 Sass 弃用、Rollup 注释和静态/动态导入提示。

## 未决问题与下一步

维护者可在菜单编辑页确认新增名称出现在图标下拉选项，并在侧栏确认实际显示效果。

## 相关设计、ADR、计划和提交

- [前端应用与应用壳](../../../design/modules/frontend.md)
- [实施计划](../../../plans/2026-07-31-expand-svg-icon-library.md)
