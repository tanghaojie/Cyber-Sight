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
- 所有位置绑定已有的 `viewer.clock`，使用按 `JulianDate` 求值的 `CallbackPositionProperty`、`VelocityOrientationProperty` 和完整三维航线图形展示，不创建第二个 Clock，也不手动在每个 tick 写入位置；每条航线定义 UTC 每日起飞秒数、飞行时长和模拟巡航高度，在航段内沿同一测地线与高度剖面插值、航段外隐藏，并在次日同一 UTC 时刻重复；完整航线以相同高度采样呈现，活动位置使用透明 Canvas 绘制、按屏幕前进方向旋转的飞机轮廓而非点位；
- 默认关闭；开启时创建本次会话的 30 条多色实体、框选全路线并通过 Time 的公开 capability 启动共享播放；左侧面板可隐藏航线而保持飞机显示。关闭或销毁时清空 `CustomDataSource`；不保存数据且不访问网络。

## 结果与限制

页面始终可离线展示航班互动，不再产生 CORS、后端路由或上游限频错误。它不是实时雷达，不代表真实航班、机场、时刻表或覆盖范围；每日航段只是可重复的前端演示语义。未来若恢复真实数据，必须重新设计可部署的数据接入边界。

## 替代

本 ADR 取代 `ADR-20260831-geo-opensky-live-flight-tracking.md`。
