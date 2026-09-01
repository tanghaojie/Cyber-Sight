---
title: Geo 默认相机与底部工作台启动状态
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-09-01
updated: 2026-09-01
---

# Geo 默认相机与底部工作台启动状态

## 目标

调整 Geo 页面首次打开后的默认相机，并让底部状态条与时间轴默认收起。

## 背景与设计依据

- Geo 初始相机由 GeoRuntime 设置，成都快捷视角由 Geo 相机工具维护；两处必须使用同一启动预置。
- 默认成都建筑是异步加载的，加载完成后的自动定位不能覆盖维护者指定的启动视角。
- 底部状态条和时间轴已经支持独立收起，本次只调整启动默认值，不改变用户手动展开/收起行为。

## 范围

- 将默认相机设为经度 `104.0700°`、纬度 `30.5000°`、高度 `1,600 m`、视角 `360.0° / -20.0°`，roll 保持 `0°`。
- 统一 GeoRuntime、成都快捷视角及默认建筑加载完成后的相机预置。
- 将状态条和所有动态底部 dock 的默认状态设为收起。
- 更新 Geo 模块设计、实施计划和 AI 协作记录。

## 非目标

- 不改变全球/中国快捷定位、用户定位、场景模式、时间轴控制或底图加载策略。
- 不新增前端自动化测试或浏览器测试。

## 前置条件和风险

- 默认建筑仍由远程数据源异步加载；静态检查无法证明真实网络加载后的相机动画和 Cesium 画面，需要人工验收。
- 低空俯视可能增加建筑与底图的视觉密度，需在 Geo 的 `1280×720` 基线下确认可读性。

## 实施任务

- [x] 更新共享成都启动相机预置及 GeoRuntime 启动/复位相机。
- [x] 防止默认建筑加载完成后的自动定位覆盖启动相机。
- [x] 将状态条和底部 dock 默认设为收起。
- [x] 更新设计与验证记录。

## 测试与验证

- [x] `pnpm format`
- [x] `pnpm format:check`
- [x] 前端 TypeScript 检查（包含在生产构建中）
- [x] 前端生产构建（授权环境通过；受限环境曾因 esbuild 读取权限失败）
- [x] `pnpm docs:archive:check:ci`
- [ ] 人工检查 Geo 打开后相机数值、建筑加载完成后的最终相机，以及状态条/时间轴独立展开与收起（待维护者验收）。

## 发布与回滚

已由 Git 提交 `feat(geo): update default view state` 发布；如人工验收发现视角不适合，回滚本提交即可恢复原启动预置。

## 实际偏差和遗留问题

静态检查和生产构建均通过；真实 Cesium 相机、远程建筑加载后的最终视角和底部工作台布局仍需维护者在浏览器中人工验收。关联提交：`feat(geo): update default view state`。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 赛博城市 3D Tiles 启动预置](../../decisions/ADR-20260901-geo-cyber-city-tileset-preset.md)
- [本次 AI 协作记录](../ai-logs/2026/09/2026-09-01-geo-default-camera-and-bottom-dock-state.md)
