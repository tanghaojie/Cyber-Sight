---
title: Geo 模型制作与地理参考契约
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: accepted
date: 2026-10-03
---

# ADR-20261003：Geo 模型制作与地理参考契约

## 背景与驱动因素

多模型录屏需要可信材料和一致定位。样本库七个独立 GLB 均无图像纹理，地理字段和定位文件不一致。用户明确要求先完成模型优化的项目标准，将场景优化分开。

## 考虑的方案

1. 加载时按名称重写材质、猜测坐标/高度：难以保留建筑特征，可能将未知参考系和建筑尺寸当成定位。
2. 只给渲染建议，资产继续采用不同约定：无法形成可检查的制作和定位流程。
3. 建立明确制作标准，保留统一渲染，新资产遵循现有支持字段：采用。

## 决策

模型优化包含几何、自带基座、PBR、UV、纹理、表面变化、静态夜景、资源预算和地理参考。周围真实城市、受光、反射、区域组织和自动资源选择属于场景优化。Sight 负责加载和渲染，制作与托管由外部资产流程承担，不新增资产后台。

交付采用局部米制 glTF 2.0、明确地面锚点和唯一 GEO_ROOT。地理元数据统一根 extras 的 longitude_wgs84 / latitude_wgs84，可选 ellipsoid_height_m。水平 WGS84 / EPSG:4326，已知绝对高度 WGS84 椭球高 / EPSG:4979；未知高度省略，选择模型坐标后按当前地形求高程；height_m 仅表示尺寸。其他参考系在制作端转换。

新资产校准真实朝向，按当前 Cesium Y-up / Z-forward 转换后的方向验收，默认 scale=1、heading/pitch/roll=0。CRS、来源、精度等说明字段和 placement.json 提供交付证据；当前不自动读取或应用朝向、缩放或质量版本。保留坐标来源确认。

材质采用可导出 PBR，纹理有对应 UV、正确色彩空间和物理尺度；区分固定表面细节、局部 AO、夜景与实时太阳。以最终 GLB 和 Sight 人工验收为依据，不以 Blender 预览代替。性能版本继续表示最佳录屏质量。

此决策补充现有模型及三档质量 ADR 的制作端契约，不替代运行时能力，不修改旧资产、坐标解析、默认影像、科技扫描、Clock 或模块边界。

## 结果、风险和复审

新资产有统一规范；旧模型需要重导出坐标、UV 与材质，并核对高程/朝向。说明字段没有运行时强校验，由制作端检查与人工验收承担正确性。自动 sidecar、CRS 转换、朝向 metadata、版本选择、场景包或引擎升级时复审，避免只改文档就宣称功能完成。

## 关联

- [制作标准](../design/modules/geo-model-authoring.md)
- [统一渲染](../design/modules/geo-model-rendering.md)
- [三档质量与坐标](ADR-20261002-geo-render-modes-and-model-placement.md)
- [实施计划](../archive/plans/2026-10-03-geo-model-authoring-standard.md)
