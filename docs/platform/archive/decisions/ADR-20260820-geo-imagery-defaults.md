---
title: Geo 影像默认源与失败隔离
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: superseded
date: 2026-08-20
superseded_by: ADR-20260820-geo-imagery-defaults-and-coordinate-correction.md
---

# ADR-20260820：Geo 影像默认源与失败隔离

> 本 ADR 已被 [Geo 影像默认源与坐标校正](../../decisions/ADR-20260820-geo-imagery-defaults-and-coordinate-correction.md) 取代。Natural Earth 默认底图的结论不再适用于当前 Geo 产品需求。

## 背景

Geo 数据插件在未配置天地图令牌时会自动回退到 Google 影像候选源。候选源的访问、CORS、网络连通性和许可均不由应用保证；在本地环境中该回退会产生连续失败的远程瓦片请求，影响地图可用性和用户对“卡死”的判断。

## 决策驱动因素

- 首屏和默认地图必须在无第三方配置时保持可用。
- 外部数据源失败不能阻塞 Viewer 或其他插件。
- 远程候选源的访问和许可必须由用户/部署方主动确认。
- 数据面板需要把配置限制和 provider 失败解释给使用者。

## 考虑的方案

1. 继续自动回退到 Google：改动最小，但在受限网络中持续失败，违反局部失败隔离。
2. 无令牌时默认本地 Natural Earth，远程候选只在用户主动选择时加载：默认可靠，保留探索能力。
3. 为所有远程源增加启动探测：会额外制造网络请求，且探测结果不能代表瓦片级 CORS、限频和许可可用性。

## 决策

采用方案 2。Natural Earth 作为无配置默认底图；天地图只有在提供令牌后参与默认流程；Google、高德等候选源不自动加载。用户主动加载后，影像 provider 的失败通过 Geo 数据状态反馈，单源失败不销毁 Viewer。

底图目录按源角色提供筛选、搜索和局部滚动。不可用源继续禁止加载，但必须显示可解释原因，例如缺少 `VITE_GEO_TIANDITU_TOKEN` 或未启用 GCJ-02 坐标校正。

## 正面结果

- 本地无外部配置时不会自动请求 Google 瓦片。
- Viewer 首屏依赖本地资源，远程源失败不会让用户误以为整个地图卡死。
- 源目录可扩展，状态和禁用原因不依赖原生 `title` 才能发现。

## 负面结果与风险

- 无令牌环境不再自动展示在线影像，需要用户主动选择并承担网络/许可确认。
- Natural Earth 不是高分辨率业务底图；真实部署仍需配置经确认的服务。
- provider 的错误事件反映瓦片请求失败，不等价于整套服务永久不可用。

## 验证和复审条件

- 本地无天地图令牌访问 `/geo` 时，仅产生本地资源请求，默认底图可见。
- 主动选择远程候选时，失败信息出现在数据面板，Viewer 仍可操作。
- 维护者人工检查 1280×720 和窄桌面宽度下目录筛选、局部滚动和键盘焦点。
- 如果未来引入服务端代理、健康探测或场景保存，重新评估本 ADR。

## 相关设计和计划

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 底图目录交互与默认加载修复计划](../plans/2026-08-20-geo-imagery-ui-and-loading.md)
- [Geo 底图目录交互与默认加载修复协作记录](../ai-logs/2026/08/2026-08-20-geo-imagery-ui-and-loading.md)
