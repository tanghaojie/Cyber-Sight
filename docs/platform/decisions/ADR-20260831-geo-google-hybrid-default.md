---
title: Geo Google 混合默认底图
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: accepted
date: 2026-08-31
supersedes: ADR-20260820-geo-imagery-defaults-and-coordinate-correction.md
---

# ADR-20260831：Geo Google 混合默认底图

## 背景

维护者要求 Geo 工作台启动时不再加载 Natural Earth II 或天地图，只加载 Google · 混合底图。此前的启动顺序会先创建 Natural Earth II，并在配置天地图令牌时额外创建两层天地图图层，无法表达当前产品默认。

## 决策驱动因素

- 首屏图层集合必须与产品默认一致，且不受天地图令牌是否存在影响。
- 保留既有影像目录、GCJ-02 坐标校正和图层故障隔离能力。
- 不把默认图层切换扩展为自动探测、自动兜底或静默重试策略。

## 考虑的方案

1. 保持 Natural Earth II 作为下层并叠加 Google · 混合底图。
2. 依据天地图令牌切换 Natural Earth II 与天地图。
3. 启动阶段只添加 Google · 混合底图，其他目录源由用户主动添加。

## 决策

采用方案 3。Data 插件安装时只调用 `addImagery('google-hybrid')`；不再自动添加 Natural Earth II、天地图影像或天地图注记，且不再读取天地图令牌来决定默认图层。

Natural Earth II、天地图和其他影像源继续保留在数据目录，用户可按需添加。Google · 混合底图的网络、CORS、限频和许可仍由部署方确认；瓦片错误仅让该图层进入可恢复的 `degraded` 状态，不会自动加载或叠加其他底图。

GCJ-02 到 WGS84 的自动坐标校正和影像图层的 `degraded -> ready` 恢复语义保持不变。

## 正面结果

- 启动请求和首屏图层严格收敛为一个 Google · 混合底图。
- 天地图令牌不再让启动行为产生分支。
- 其他来源仍保持可见、可选和局部故障隔离。

## 负面结果与风险

- Google 服务不可用时，首屏不再有自动本地兜底，使用者需要从目录手动添加其他可用底图。
- Google 访问、CORS、限频和商业许可风险仍需要部署方确认。

## 验证和复审条件

- 无论是否设置 `VITE_GEO_TIANDITU_TOKEN`，进入 `/geo` 后默认图层仅为 Google · 混合底图。
- Natural Earth II 与任一天地图图层不会在启动阶段创建或请求瓦片；手动添加仍可用。
- Google 瓦片失败只标记该图层为 `degraded`，不会自动添加其他底图；后续真实请求成功可恢复为 `ready`。
- 如果产品需要离线首屏或自动故障兜底，必须复审本 ADR。

## 相关设计和计划

- [Geo 前端空间可视化工作台](../design/modules/geo.md)
- [Geo Google 混合默认底图计划](../archive/plans/2026-08-31-geo-google-hybrid-default.md)
