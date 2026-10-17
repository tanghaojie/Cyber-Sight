---
title: 建筑建模与飞入拼装要求同步
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-17
status: completed
change_type: docs
---

# 建筑建模与飞入拼装要求同步

## 用户目标和约束

读取「Blender建筑爆炸动画」要求，更新 Cyber-Sight 建模详细要求，再把材质、光照、爆炸动画、部件、位置等信息写入 AIModels，供后续建模使用。

## 关键问答与确认

`read_thread` 读取了会话 `6ad2cbc7-5560-83e9-a3c3-6afb06ff711e` 的全部两轮：用户希望建筑爆炸体逐渐搭建，并明确要求建筑从无到有、构件逐步飞入拼装。助手正文只返回 `chatgpt-content-reference`，未取得原方案或脚本；本次不将其当作已读脚本。

## AI 的重要假设

本次只交付文档；时长、帧率、路径、预算和命名为可执行的规范约定或建议起点，不是原会话给出的参数。保留原有地理参考、统一昼夜和发布 v1，分别交付静态模型与单一目的动画文件。

## 方案和执行摘要

在现行制作标准下增加分件/动画专题和长期决策。AIModels 提供完整制作规范、逐项目任务书及入口说明。将摄影棚照明与 GLB 运行时太阳区分，要求实际节点材质、最终 GLB 检查，避免只改视口颜色。部件清单及动画说明仅供制作与验收，消费端不会自动读取。

## 验证结果

初始两仓库暂存区为空且工作区干净；Cyber-Sight 初始及最终归档 CI 为 NOT_DUE。`pnpm format`、`pnpm format:check` 和 AIModels 六份文档的同配置格式检查通过。共 17 份变更 Markdown 的 323 个本地链接、4 个 JSON 示例、共同标准/修订日期、示例时间/帧换算和构件起止检查通过。两仓库 `git diff --check` 通过，确认只有 Markdown 变化。AIModels 既有发布检查通过：8 个模型、134 个模型/依赖文件，未改动清单和资产。

技术参考使用 agent-reach 网页阅读后端核对 Blender 5.1 glTF 导出说明，并核对 Khronos 核心节点/动画规范；实际建模仍须验证其安装版本。未运行前端/浏览器自动化、建模脚本或 GPU 播放验收。

## 未决问题与下一步

后续每栋建筑需要实际资料、尺寸、坐标来源、分件、脚本和视觉验收；本次没有新资产、运行时或发布交付。

## 相关设计、ADR、计划和提交

- [制作标准](../../../../../design/modules/geo-model-authoring.md)
- [分件与动画](../../../../../design/modules/geo-model-assembly-authoring.md)
- [ADR](../../../../../decisions/ADR-20261017-building-assembly-authoring.md)
- [计划](../../../../../archive/plans/2026-10-17-building-modeling-requirements.md)
- Cyber-Sight 基线 `7e31597669306dd8e9d3c129018859b99dcdff5e`；AIModels 基线 `e913492a6616addd9c395667462270f7fd871ccf`。最终提交通过文件 Git 历史追溯。
