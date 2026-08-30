---
title: Geo 单一仿真时间与太阳光照
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: accepted
date: 2026-08-30
---

# ADR-20260830：Geo 单一仿真时间与太阳光照

## 背景

Geo 已隐藏 Cesium 原生 `Animation` 与 `Timeline` 控件，但 Viewer 仍拥有 `viewer.clock`。时间轴、太阳昼夜变化以及未来飞机等动态对象需要共享同一时间，否则拖动、倍速和暂停会产生不同步状态。

## 决策驱动因素

- 保持时间控制、太阳光照和未来动态对象的确定性同步；
- 延续 Geo 编译期插件和动态 UI contribution 边界；
- 让时间轴符合当前暗色宽屏工作台，而不是重新启用 Cesium 原生控件；
- 将高 GPU 成本的阴影与基础太阳光照分开控制。

## 考虑的方案

1. 重新启用 Cesium 原生 `Animation` 与 `Timeline`：实现成本低，但视觉、布局和扩展能力不符合当前工作台。
2. 为每个动态插件创建独立 Clock：局部实现简单，但暂停、拖动和倍速会失去统一语义。
3. 自定义 Time 插件控制 `viewer.clock`，通过插件 contribution 发布常驻底部时间轴：与现有架构一致，并能成为后续动态能力的唯一时间源。

## 决策

采用方案 3：

- Geo 只使用 Viewer 自带的 `viewer.clock`，关闭 DataSource 自动接管 Clock，并禁止 Time、Scene 或未来 Flight 插件创建第二个 `Clock`；
- Time 插件把当天 UTC `00:00` 至次日 UTC `00:00` 作为默认循环范围，内部继续使用 Cesium `JulianDate`，界面明确显示 UTC；
- 时间轴提供播放/暂停、拖动定位、回到当前时刻和倍速控制；时钟停止时不持续请求渲染；
- 扩展插件契约增加窄范围 `bottomDocks` contribution，工作台 Shell 只按注册表结果渲染常驻底部组件，不直接导入 Time 组件；
- Scene 插件通过 capability 发布太阳光照端口，Time 插件只消费该端口，不穿透读取 Scene controller；
- 本阶段动态光照只包含太阳驱动的地球光照与太阳阴影。太阳光照默认开启；阴影因 GPU 成本默认关闭并提供独立开关；不实现月光、人工光源、天气或大气散射模拟。

## 正面结果

- 所有动态能力可围绕同一时间源同步；
- 时间轴与 Scene 保持明确所有权和单向依赖；
- 暂停时保留显式渲染模式的空闲性能收益；
- 阴影成本由用户显式选择。

## 负面结果与风险

- 播放时需要持续请求渲染，GPU 占用会高于静止场景；
- 24 小时 UTC 范围是首版固定策略，跨日事件和任意业务时间范围需要后续扩展；
- 阴影效果取决于地形、模型的阴影模式和设备能力，静态类型/构建验证不能替代浏览器人工验收。

## 验证和复审条件

- 拖动、播放、暂停、倍速和循环必须只改变 `viewer.clock`；
- 开启太阳光照后，时间变化应改变地球明暗；阴影关闭时不得承担阴影渲染成本；
- 页面重复进入/退出后不得累积 Clock 监听器；
- 若引入跨日业务事件、真实航班或第二种光源，应复审时间范围和太阳光照端口。

## 相关设计和计划

- [Geo 前端空间可视化工作台](../design/modules/geo.md)
- [Geo 前端编译期插件架构](ADR-20260814-geo-frontend-plugin-architecture.md)
- [Geo 时间轴与太阳光照实施计划](../archive/plans/2026-08-30-geo-time-and-solar-lighting.md)
