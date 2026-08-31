---
title: Geo 模拟航线完整连线与飞机图标协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo 模拟航线完整连线与飞机图标协作记录

## 用户目标

用户反馈模拟航线没有完整连接开始、结束点，并要求模拟飞机用飞机图标而不是圆点表示。

## 诊断与计划

动态 `PathGraphics` 使用 lead/trail 时间窗口，只能显示当前位置附近的有限轨迹，不能承担固定完整航线。将在同一数据源中额外绘制起终点完整大圆线，并以随源码发布的 SVG 飞机图标取代 `PointGraphics`；时间轴位置插值仍由现有单一 `viewer.clock` 驱动。

## 实际改动与验证

- 为每条模拟航班增加 `ArcType.GEODESIC` 的完整起终点航线，同时保留短动态轨迹表达当前位置附近的运行历史；
- 用内置 data-URI SVG 飞机图标替代圆点，未增加网络请求、外部图片资产或运行依赖；
- 格式、所有权、文档门禁与 diff 检查通过；前端生产构建和 lint 在授权环境通过；
- 根据仓库前端验证边界，浏览器视觉互动仍由维护者人工验收。
