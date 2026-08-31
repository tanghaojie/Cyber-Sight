---
title: Geo 前端模拟航班数据
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: accepted
date: 2026-08-31
---

# ADR-20260831：Geo 前端模拟航班数据

## 背景

Geo 需要可演示的航空器和航迹，但 OpenSky、adsb.fi 等公开 ADS-B 服务不能由 Cyber-Sight 浏览器可靠跨域读取；代理与纯前端目标冲突。

## 决策

- 删除 Platform `geo` 后端模块、OpenSky HTTP 契约、服务测试和前端 API 调用；
- 航班插件只提供内置、明确标注为模拟的航线；
- 所有位置样本绑定已有的 `viewer.clock`，使用 `SampledPositionProperty`、`VelocityOrientationProperty` 和路径图形展示，不创建第二个 Clock，也不手动在每个 tick 写入位置；每条航线另以始末点之间的完整大圆线稳定呈现，活动位置使用随前端构建发布的本地 SVG 飞机图标而非点位；
- 默认关闭；开启时创建本次会话实体，关闭或销毁时清空 `CustomDataSource`；不保存数据且不访问网络。

## 结果与限制

页面始终可离线展示航班互动，不再产生 CORS、后端路由或上游限频错误。它不是实时雷达，不代表真实航班、机场、时间或覆盖范围；未来若恢复真实数据，必须重新设计可部署的数据接入边界。

## 替代

本 ADR 取代 `ADR-20260831-geo-opensky-live-flight-tracking.md`。
