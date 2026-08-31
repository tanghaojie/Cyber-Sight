---
title: Geo 模拟飞机透明 Canvas 图标协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo 模拟飞机透明 Canvas 图标协作记录

## 用户目标

用户确认本地 SVG 已加载，但运行时仍显示为黑色方框。

## 诊断与计划

资源路径和生产产物已经通过；问题位于 SVG 进入 Cesium billboard 纹理后的渲染。改用透明 Canvas 的二维轮廓，直接传入 `BillboardGraphics.image`，避开 SVG 解码并保留离线、无网络资源边界。

## 实际改动与验证

- 删除 `public/geo/aircraft.svg`，在模拟航班图层初始化时创建 64×64 透明 Canvas 并绘制青色、深色描边的飞机轮廓；
- billboard 直接引用 Canvas，因此不会触发 SVG 资源请求、内联 URI 或外部图标加载；
- 前端生产构建、lint、格式、所有权和 diff 检查通过；浏览器视觉表现依仓库规则保留给维护者人工验收。
