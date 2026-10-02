---
title: Geo 浏览器时区显示与太阳驱动环境光
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: accepted
date: 2026-10-02
---

# ADR-20261002：Geo 浏览器时区显示与太阳驱动环境光

## 背景与决策

维护者要求时间轴显示浏览器时区，并改善模型太阳光与环境光的昼夜一致性。

- 时间轴的当前时间、边界和刻度使用浏览器本地时区；当前时间、边界与刻度提示显示该时刻的 UTC 偏移，当前时间提示显示浏览器时区名称。浏览器环境变更时刷新页面重新取值。
- 初始与“回到现在”的窗口为浏览器本地当天午夜至次日午夜，夏令时日允许 23 / 25 小时。日、月、年刻度按本地日历对齐，短时刻度避免通过本地 setters 丢失回拨时重复的秒、分钟。
- 内部继续使用 epoch milliseconds 和唯一 `viewer.clock` 的 JulianDate；不手工添加时区偏移，不改变太阳所在地计算或航班 UTC 每日周期。
- Scene 安装时将 `scene.atmosphere.dynamicLighting` 设为 SUNLIGHT，释放时恢复原值。太阳图形显隐、地球光照开关与模型环境光保持独立语义。
- Data 创建外部 Model 和 Cesium3DTileset 时配置 `maximumSecondsDifference: 300`，由 Cesium 自身环境贴图生命周期执行更新；不新增计时器、不手工逐帧重置。
- 保留夜间 IBL 0.2、自发光处理、阴影默认值及科技扫描，先为环境光修正建立可比较基线。

本 ADR 调整 [单时钟 ADR](ADR-20260830-geo-simulation-time-and-solar-lighting.md) 的 UTC 显示要求，并扩展 [外部模型渲染 ADR](ADR-20260911-geo-external-model-rendering.md) 的环境光配置；其余生命周期和模块边界继续有效。

## 风险与验证

浏览器本地时间与模型所在地时间可能不同；太阳始终按绝对时刻与模型位置求值。日期偏移在夏令时边界可变化。SUNLIGHT 会影响原生 PBR 模型和 tileset 的环境反射，环境贴图生成存在异步延迟和 GPU 成本；高倍速、暂停拖动及真实资产效果需人工验收。静态检查和构建不能代替视觉验收。

## 关联

- [时间轴设计](../design/modules/geo-unbounded-timeline.md)
- [模型渲染设计](../design/modules/geo-model-rendering.md)
- [实施计划](../archive/plans/2026-10-02-geo-local-time-and-solar-environment.md)
