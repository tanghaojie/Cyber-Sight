---
title: Geo 航班视图、航线与播放联动
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-09-01
status: completed
---

# Geo 航班视图、航线与播放联动

## 用户目标和约束

用户要求：开启模拟航班后自动播放时间轴并取景所有航线；扩展为 30 条航线；使航线和飞机按一致高度显示；重新设计适合地图主题的多色；并在左侧航班面板支持隐藏航线、只显示飞机。

仓库约束：Geo 为 Platform 前端模块；保留单一 `viewer.clock`、纯本地模拟和人工浏览器验收边界；前端自动化测试不在范围内。

## 关键问答与确认

无额外阻塞。将“真实高度”落实为物理合理、按航段变化的模拟飞行高度；不将其表述为实时航班数据。

## AI 的重要假设

开启 Flight 只启动共享 Time 播放，不在关闭 Flight 时擅自暂停用户的时间轴。相机框选采用全路线三维点集，而非当前时刻可见的飞机。

## 方案和执行摘要

Time 发布 `time.playback` capability，只暴露 `setPlaying`；Flight 声明对 Time 的依赖后使用该能力启动共享 Clock。航线层扩展为 30 条国内及周边模拟航线，以 48 个位置样本生成每条三维航线；飞机位置和航线使用同一测地线与高度剖面。相机按所有航线点集框选，五种高对比色同时应用于路线、Canvas 飞机图标和高度标签。左侧面板新增“显示航线”开关，仅隐藏路线实体。

## 验证结果

`pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check` 和 `git diff --check` 通过。前端生产构建首次在 Windows 沙箱中因 Vite 配置目录读取权限失败；按原命令在授权环境复跑后通过。保留既有 Sass、Rollup 注释和 Geo chunk 体积警告。

## 未决问题与下一步

维护者仍需进行浏览器人工验收，尤其是启用后的自动播放与全航线取景、三维高度对齐、颜色可读性、隐藏航线后飞机持续显示，以及 GPU 表现。

## 相关设计、ADR、计划和提交

- [实施计划](../../../plans/2026-09-01-geo-flight-visualization-and-playback.md)
- [归档审查计划](../../../../plans/active/2026-09-01-platform-documentation-archive-review.md)
- [Geo 设计](../../../../design/modules/geo.md)
- [模拟航班 ADR](../../../../decisions/ADR-20260831-geo-simulated-flight-data.md)
