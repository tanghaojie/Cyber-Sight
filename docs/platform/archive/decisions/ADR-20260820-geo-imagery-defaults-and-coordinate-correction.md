---
title: Geo 影像默认源、失败隔离与坐标校正
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: superseded
date: 2026-08-20
supersedes: ADR-20260820-geo-imagery-defaults.md
superseded_by: ADR-20260831-geo-google-hybrid-default.md
---

# ADR-20260820：Geo 影像默认源、失败隔离与坐标校正

> 本 ADR 已被 [Geo Google 混合默认底图](../../decisions/ADR-20260831-geo-google-hybrid-default.md) 取代。Natural Earth II 与天地图的自动启动加载不再适用于当前 Geo 产品需求；坐标校正和可恢复瓦片状态由新 ADR 延续。

## 背景

Geo 工作台需要在无第三方网络或令牌的环境中仍提供可用首屏，同时保留天地图、高德、Google 等候选源。高德公开瓦片使用 GCJ-02，不能未经转换就叠加到 WGS84 的 Cesium Viewer 上。远程瓦片的 CORS、网络、限频和许可不由应用保证，单次失败也不应让场景失去可用底图。

## 决策

1. 数据插件启动时始终加载本地 Natural Earth II；配置 `VITE_GEO_TIANDITU_TOKEN` 时再在其上叠加天地图影像与注记。Google、高德与其余远程源均保持用户主动添加的候选源。
2. 天地图影像、矢量及独立注记仍由 `VITE_GEO_TIANDITU_TOKEN` 配置；缺少令牌时只影响对应远程候选或叠加层，Natural Earth 不被移除。
3. 坐标校正配置默认使用 `auto`。源坐标系为 `GCJ-02` 时，影像适配层自动使用 GCJ-02 到 WGS84 的瓦片坐标转换；WGS84 源不转换。
4. 坐标校正以策略类型和注册入口组织，当前只实现 GCJ-02 到 WGS84，后续坐标系转换不得散落在各 provider 工厂中。
5. 远程源的 CORS、网络、限频、服务稳定性和许可风险仍由部署方确认；provider 瓦片错误只把对应图层标记为可恢复的 `degraded`，后续真实瓦片请求成功时恢复 `ready`，不销毁 Viewer 或本地兜底层。

## 选择理由

- 本地默认源不依赖不受控的远程瓦片，候选源仍保持显式可见和局部失败隔离。
- 把校正放在影像适配层，Vue 面板和 controller 无需理解瓦片坐标细节，也避免把 GCJ-02 当作已经对齐的 WGS84 数据。
- `auto` 与策略类型为后续 BD-09、其他地方坐标或服务端重投影保留清晰扩展点。

## 实现边界

当前转换以 WGS84 请求瓦片的中心点转换为 GCJ-02 源瓦片坐标，沿用 Web Mercator 瓦片级请求；它解决源瓦片网格偏移，不等同于高精度逐像素重投影。需要高精度重投影时，应重新评估自定义 imagery provider、代理或服务端处理方案。

## 验证和复审条件

- 进入 `/geo` 后默认图层包含 Natural Earth II；没有天地图令牌时不自动请求 Google、高德等远程瓦片。
- 配置天地图令牌时，Natural Earth 位于天地图影像和注记下方；远程瓦片失败后本地底图仍可见。
- 选择高德候选时无需再打开面板开关，provider 使用默认校正策略；WGS84 源请求保持原有坐标。
- 维护者人工检查底图、注记、候选源、坐标对齐、网络失败隔离和横向桌面基线下的面板交互。
- 如果默认源、远程服务访问/许可策略变化，或需要高精度重投影，复审本 ADR。

## 相关设计和计划

- [Geo 前端空间可视化工作台](../design/modules/geo.md)
- [Geo 前端交互完善计划](../archive/plans/2026-08-20-geo-frontend-interaction-completion.md)
