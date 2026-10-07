---
title: Geo 模型制作与地理参考标准协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-03
status: completed
change_type: docs
---

# Geo 模型制作与地理参考标准协作记录

## 用户目标和约束

把第二轮建议分为模型优化、场景优化，先补充详细建模要求，覆盖材质、UV、纹理、表面变化，统一坐标格式和参考系。性能代表最佳录屏画质、平衡默认、兼容低配；默认影像由用户手动调整。

## 关键确认与假设

本轮落实 Cyber-Sight 文档标准，不包括重建七个源模型或修改样本托管仓库。坐标采用当前支持的 WGS84 字段，旧资产需要重导出，不把说明字段写成运行时功能。资产自带场地归模型优化；周围真实城市、反射和场景级受光归场景优化。沿用工作分支推送授权。

## 执行摘要

- 暂存门禁通过，工作区为空，归档审计 NOT_DUE。
- 阅读现行设计与 ADR，核对 model-asset.ts、data-browser.ts、model-rendering.ts 及 Cesium 1.144 支持源码。
- 标准区分规范字段与读取字段，补充 EPSG:4326 / EPSG:4979、椭球高、局部锚点和默认 forwardAxis 转换，避免误写 Blender X 轴等于地理东。
- 新增详细制作标准和 ADR，同步 Geo 设计、模型渲染/定位说明及文档入口；模型优化与场景优化分工明确。计划与日志完成后归档。

## 验证结果

- pnpm format:check：通过。
- pnpm docs:archive:check:ci：NOT_DUE，通过；文档链接由归档审计检查。
- git diff --check：通过。
- JSON metadata 示例解析、坐标范围、未知高度省略与现行字段交叉检查：通过。
- 材质扩展支持表与 Cesium 1.144 / engine 26.2.0 源码交叉检查：通过。轴向根据 GltfLoader 默认值、ModelUtility 和 Axis 的转换矩阵核对。
- 只有 Markdown 修改，未运行应用构建或前端/浏览器测试；没有重导出或部署七个模型，不将静态通过描述为视觉验收。

## 下一步

按标准重制资产并由维护者在 Sight 中验收昼夜和 3600 倍速。场景优化及新加载能力另行实施。

## 关联

- [制作标准](../../../../../design/modules/geo-model-authoring.md)
- [决策](../../../../../decisions/ADR-20261003-geo-model-authoring-and-georeference.md)
- [计划](../../../../../archive/plans/2026-10-03-geo-model-authoring-standard.md)
- 基线提交：eb4e985。本轮提交：docs(geo): define model authoring and georeference standard，包含实际模型 GPT-6 的规定 trailer。
