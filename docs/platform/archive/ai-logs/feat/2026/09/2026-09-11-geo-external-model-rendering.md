---
title: Geo 外部模型统一渲染协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-09-11
status: completed
change_type: feat
---

# Geo 外部模型统一渲染协作记录

## 用户目标和约束

用户确认模型由外部提供，普通用户只添加 URL 与定位；系统制定统一渲染标准，不建设资产和模型管理。2026-09-11 授权直接实施，具体代码由 Luna 子智能体完成，主智能体负责节奏、设计、审查和验证。

## 关键确认与假设

采用现有唯一 Clock，Emissive 作为外部模型的夜景通道。无此通道不能自动生成窗灯。统一默认值由系统维护，不暴露 Profile。当前地球光照开关澄清文案，模型自动昼夜独立运行，阴影保持全局独立开关。

## 执行摘要

初始暂存区检查通过，工作区为空；归档审计 NOT_DUE。渲染和 Data 接入分给两个 Luna 子智能体，第三个 Luna 只读审查异常路径；主智能体编写文档、复核源码并执行最终验证。按 cavecrew 的紧凑证据格式汇报结果。

实现 `scene.modelRendering` 能力，按每模型太阳高度控制 Emissive、IBL 和直射光；Data 在 ready 后首次可见绘制前登记，变换/移除/退出对应更新和释放。UI 仅保留 URL/定位为基础输入，姿态缩放收为可选项；明确地球光照开关，材质说明区分不发光和 Unlit。

审查促成修正：preUpdate 参数、地理法线、共享太阳计算、夜到昼光色恢复、暂停光源变化、销毁清理、Emissive 强度 0/Unlit 检测。复核 Cesium 源码确认 Shader 编译异常不触发 Model.errorEvent，据此将接入移到 ready 后；等待期间场景失败/取消/退出终止等待，混合资源场景不再误回退全部 Tileset。ready 后 GPU 故障仍无法自动归因，只报告场景级错误。

## 验证结果

最终格式化/格式检查、lint、架构边界、frontend 类型与生产构建、文档归档 CI 和 diff 检查通过；归档结果 NOT_DUE。构建包含 Sight/Geo 双入口，仍有 Sass legacy API、Rollup PURE 注释及大块体积警告。Vite 沙箱读取失败经正常权限复跑通过；材质提示变量作用域错误由 Luna 修正后重新通过类型和构建检查。未运行前端自动化或浏览器测试。

## 未决问题与关联记录

GPU、外部模型及昼夜视觉由维护者按设计人工验收。

- [设计](../../../../../design/modules/geo-model-rendering.md)
- [ADR](../../../../../decisions/ADR-20260911-geo-external-model-rendering.md)
- [计划](../../../../plans/2026-09-11-geo-external-model-rendering.md)
- 提交：包含本记录的 `feat(geo): standardize external model day-night rendering`，由 gpt-5.6-luna 创建并核对 trailer；不推送或部署。
