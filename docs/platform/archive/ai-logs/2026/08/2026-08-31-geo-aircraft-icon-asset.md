---
title: Geo 模拟飞机本地 SVG 图标协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo 模拟飞机本地 SVG 图标协作记录

## 用户目标

用户反馈模拟飞机 SVG 图标没有加载成功。

## 诊断与计划

当前 billboard 使用运行时拼接的 `data:image/svg+xml` URL。为避免该 URI 在 Cesium 或页面安全策略下被拒绝，改用 Vite `public/geo/` 中发布的本地 SVG URL；该方式不产生外部网络请求。

## 实际改动与验证

- `simulated-flight-layer.ts` 现在将 billboard 图像固定指向 `/geo/aircraft.svg`；
- Vite 对源码资源仍会内联小 SVG，因此最终资源放在 `apps/frontend/public/geo/`，生产产物已实证含有 `dist/geo/aircraft.svg`；
- 前端生产构建、lint、格式、所有权和 diff 检查通过；浏览器视觉互动依仓库规则保留给维护者人工验收。
