---
title: Geo 工作台与地形人工验收问题修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo 工作台与地形人工验收问题修复

## 用户目标和约束

修复维护者人工验收发现的七项 Geo 问题：侧栏与底栏重叠、数据面板过窄、地形切换无 loading、等高距增减控件不协调、坡度/坡向着色报错、淹没需要手工输入经纬度，以及剖面采样线无法单独清除。

## 关键问答与确认

用户明确要求淹没使用地图交互，而不是不填写坐标时使用默认值。

## AI 的重要假设

底部栏指 Time 插件的常驻 dock；它应横向贯通，而工具轨和上下文面板应为实际 dock 高度避让。Geo 继续只支持横向桌面视口。

## 方案和执行摘要

工作台将 `bottomDocks` 设为横向贯通，侧栏共享 dock 高度预留；上下文面板可拖动调整到 360px 至 640px。数据控制器在地形异步请求期间写入目标 `loading` 快照，数据面板显示旋转状态并禁用重复切换。坡度和坡向改为 Canvas 色带。淹没改为 `InteractionManager` 管理的地图多边形绘制，剖面另有独立清除操作并不会终止淹没会话。

## 验证结果

`pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`pnpm docs:archive:check:ci` 和 `git diff --check` 通过。前端生产构建的 TypeScript 阶段通过；受限沙箱中的 Vite/esbuild 目录访问失败后，在授权环境以相同命令完成生产构建。构建保留既有 Sass 弃用和 Rollup 注释提示。

## 未决问题与下一步

维护者仍需人工检查横向桌面视口下的 dock/侧栏避让、面板拖拽、地形 loading、坡度和坡向色带、交互淹没与剖面线单独清除；这些动态 Cesium 行为不能由静态检查替代。

## 相关设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../design/modules/geo.md)
- [实施计划](../../../plans/2026-08-31-geo-workbench-terrain-acceptance-fixes.md)
