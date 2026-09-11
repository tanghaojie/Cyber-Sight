---
title: Geo 外部模型统一渲染
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: accepted
date: 2026-09-11
---

# ADR-20260911：Geo 外部模型统一渲染

## 背景与驱动因素

既有地球光照随 Clock 变化，但外部 GLB 没有系统统一的昼夜材质控制。用户要求只填 URL 和定位，外部模型与渲染分离。

## 考虑的方案

1. 各模型编写专属逻辑：需要重复代码和监听器，不能满足普通用户接入。
2. 用户选择 Profile、逐个配置灯光：增加无必要的操作与资产耦合。
3. Scene 提供统一渲染标准和管理器，Data 自动登记外部模型：采用此方案。

## 决策

以 Geo 内部 `scene.modelRendering` capability 连接 Data 与 Scene。Scene 拥有唯一渲染管理器和默认曲线，Data 拥有 Model/定位，Time 仍唯一控制 Clock。PBR Emissive 作为夜景通道按模型所在地太阳高度渐变；保留 Unlit/透明度等原始语义，无发光通道不生成灯光。按单模型调节 IBL 与太阳直射，避免全局改光影响其他资源。

外部模型默认自动应用标准，不要求用户填写材质参数。现有地球光照开关保持只作用于地球表面，并明确文案；模型随时间自动昼夜，阴影遵循 Scene 开关。此决策扩展 20260830 太阳光照 ADR 的模型渲染范围，其单时钟和低空闲开销决策继续有效。

不建设模型资产、目录、持久化、后端、点光源或外部发布流程，不改变已有 3D Tiles 正常科技扫描。混合资源场景的无归属渲染异常只报场景故障，不再据此清除所有 Tileset 样式；没有模型时保留既有回退。

## 结果、风险与复审

新增模型无需专属代码。代价是资产应遵守 Emissive 夜景约定；既有常亮自发光资产白天会被关闭。无法可靠检测的材质能力保持未知。Cesium 升级、第二套渲染标准、需要常亮材质或真实人工光源时复审。Shader 和 GPU 行为通过维护者人工验收，静态门禁不替代视觉验证。

## 关联

- [渲染标准](../design/modules/geo-model-rendering.md)
- [实施计划](../archive/plans/2026-09-11-geo-external-model-rendering.md)
- [单时钟 ADR](ADR-20260830-geo-simulation-time-and-solar-lighting.md)
