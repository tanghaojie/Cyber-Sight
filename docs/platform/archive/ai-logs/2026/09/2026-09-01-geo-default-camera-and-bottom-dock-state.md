---
title: Geo 默认相机与底部工作台启动状态
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-09-01
status: completed
---

# Geo 默认相机与底部工作台启动状态

## 用户目标和约束

Geo 页面打开时使用经度 `104.0700°`、纬度 `30.5000°`、高度 `1.6 km`、视角 `360.0° / -20.0°`；底部状态条和时间轴默认不展开。遵守 Geo 现有插件边界、单一 Viewer 和前端人工验收边界。

## 关键问答与确认

用户直接提出目标，没有额外问答。

## AI 的重要假设

- “默认相机状态”包含 GeoRuntime 的初始视角、成都快捷视角及默认建筑异步加载完成后的最终视角，避免用户看到的最终状态被自动定位覆盖。
- “底图状态栏”对应 Geo 工作台的 `GeoStatusBar`；“时间轴”对应 `bottomDocks` 中的 Time dock。
- 高度按 Cesium 椭球高处理，`1.6 km` 实现为 `1,600 m`；roll 未指定，保持 `0°`。

## 方案和执行摘要

已共享默认相机预置并统一启动相关相机入口；默认建筑自动定位完成后回到该预置；状态条和动态底部 dock 的缺省值均设为收起；Geo 设计、计划和归档索引已同步。

## 验证结果

格式、Lint、架构检查和文档归档 CI 通过；前端生产构建在授权环境通过，受限环境的同一构建曾因 esbuild 读取权限失败。真实 Cesium 相机和底部布局仍需维护者人工验收。

## 未决问题与下一步

无新增范围。本记录与计划已归档；提交 `feat(geo): update default view state` 已完成。

## 相关设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../../design/modules/geo.md)
- [Geo 赛博城市 3D Tiles 启动预置](../../../../decisions/ADR-20260901-geo-cyber-city-tileset-preset.md)
- [实施计划](../../../../archive/plans/2026-09-01-geo-default-camera-and-bottom-dock-state.md)

提交：`feat(geo): update default view state`
