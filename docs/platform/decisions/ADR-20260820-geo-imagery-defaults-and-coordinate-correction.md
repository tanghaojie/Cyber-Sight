---
title: Geo 影像默认源与坐标校正
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: accepted
date: 2026-08-20
supersedes: ADR-20260820-geo-imagery-defaults.md
---

# ADR-20260820：Geo 影像默认源与坐标校正

## 背景

Geo 工作台需要在打开页面后直接提供可用的底图和注记，同时保留天地图、高德等候选源。高德公开瓦片使用 GCJ-02，不能未经转换就叠加到 WGS84 的 Cesium Viewer 上。此前为避免远程请求失败而选择 Natural Earth 默认源，但当前产品需求明确要求 Google 作为默认底图和注记。

## 决策

1. 数据插件启动时加载 Google 混合影像作为默认底图，加载 Google 注记作为默认覆盖层；Google 其他影像、道路和地形源继续作为候选。
2. 天地图影像、矢量及独立注记全部归入候选源。令牌仍通过 `VITE_GEO_TIANDITU_TOKEN` 提供，缺少令牌时只影响该候选源。
3. 坐标校正配置默认使用 `auto`。源坐标系为 `GCJ-02` 时，影像适配层自动使用 GCJ-02 到 WGS84 的瓦片坐标转换；WGS84 源不转换。
4. 坐标校正以策略类型和注册入口组织，当前只实现 GCJ-02 到 WGS84，后续坐标系转换不得散落在各 provider 工厂中。
5. 远程源的 CORS、网络、限频、服务稳定性和许可风险仍由部署方确认；provider 瓦片错误只标记对应图层，不销毁 Viewer。

## 选择理由

- 默认源直接符合 Geo 使用者的产品预期；候选源仍保持显式可见和局部失败隔离。
- 把校正放在影像适配层，Vue 面板和 controller 无需理解瓦片坐标细节，也避免把 GCJ-02 当作已经对齐的 WGS84 数据。
- `auto` 与策略类型为后续 BD-09、其他地方坐标或服务端重投影保留清晰扩展点。

## 实现边界

当前转换以 WGS84 请求瓦片的中心点转换为 GCJ-02 源瓦片坐标，沿用 Web Mercator 瓦片级请求；它解决源瓦片网格偏移，不等同于高精度逐像素重投影。需要高精度重投影时，应重新评估自定义 imagery provider、代理或服务端处理方案。

## 验证和复审条件

- 进入 `/geo` 后默认图层列表包含 Google 混合影像和 Google 注记，天地图不自动加入当前图层。
- 选择高德候选时无需再打开面板开关，provider 使用默认校正策略；WGS84 源请求保持原有坐标。
- 维护者人工检查底图、注记、候选源、坐标对齐、网络失败隔离和不同桌面宽度下的面板交互。
- 如果 Google 访问或许可策略变化，或需要高精度重投影，复审本 ADR。

## 相关设计和计划

- [Geo 前端空间可视化工作台](../design/modules/geo.md)
- [Geo 前端交互完善计划](../archive/plans/2026-08-20-geo-frontend-interaction-completion.md)
