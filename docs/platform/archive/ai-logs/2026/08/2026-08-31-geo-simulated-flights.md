---
title: Geo 前端模拟航班协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo 前端模拟航班协作记录

## 用户目标

用户确认不再使用实时航班数据，要求 Geo 航班能力改为前端模拟数据。

## 关键证据与决策

- OpenSky 的实时响应只允许其自身 Origin；adsb.fi 可由命令行取得数据，但不返回浏览器可读取的 CORS 响应头且预检请求返回 `405`；
- 因此不保留任何浏览器外部航班请求或项目内代理；
- 模拟航班使用现有 `viewer.clock`，由 `SampledPositionProperty` 和 `VelocityOrientationProperty` 表达位置与航向，避免第二个 Clock 或 `clock.onTick` 手动定位。

## 实际改动与验证

- 删除 `apps/backend/src/platform/modules/geo/`、其测试、共享 OpenSky Schema 和前端 `geo.api.ts`；
- 新增纯 Cesium 的 `simulated-flight-layer.ts`，内置 8 条中国区域示例航线；
- Flight 面板改为明确的模拟数据说明、数据源和时间轴状态，不再显示请求、配额或网络错误；
- API 契约与后端构建通过；前端生产构建在授权环境通过；格式、lint、所有权检查和 diff 检查通过；
- 受仓库前端验证边界限制，尚需维护者人工确认时间轴驱动、关闭清理和路由重入行为。
