---
title: AIModels 模式与精细度的兼容声明
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: accepted
date: 2026-10-19
---

# ADR-20261019：AIModels 模式与精细度的兼容声明

## 背景与决策

维护者要求在模型目录选择精细度与静态/飞入/爆炸模式，并要求旧配置使用默认值。保留现行 v1 静态 model/variants，新增可选 modes（仅 assembly、explode）、defaultMode 和 defaultVariant；静态始终由顶层 model/variants 声明。模式内独立声明 model、variants 和 defaultVariant，不把播放模式混入质量列表或配套资源。

未声明 modes 为无额外模式，variants 为无额外精细度，defaultMode 为 static，defaultVariant 为 original。原始版指各模式自己的主文件。显式默认值须引用存在的模式/精细度，未知或重复声明拒绝。生产者输出规范化默认值与各模式摘要；消费者也兼容旧 v1 缺字段。仅新增可选字段且保留原字段语义，因此作为 v1 向后兼容扩展；不兼容变更仍须升级版本。

## 取舍与边界

相较文件名猜测或 Sight 内硬编码，资产配置成为唯一来源。代价是双方维护新字段、生成校验与默认规则的一致性。仅提供实际资产组合；未来自定义模式再扩展契约。parts.json/animation.json 仍是制作附录，不在运行时读取。

Sight 选择后点击加载/重新加载，身份包括模型、模式及精细度；整组替换与释放沿用现有加载器，不承诺无缝切换。加载动画不自动播放，复用局部 GLB 播放器，不修改 viewer.clock。

## 验证和复审

生产者测试覆盖旧配置默认、各模式独立精细度、默认引用、缺失/越界资源和生成摘要。Sight 进行类型、构建、格式、Lint、模块边界检查；交互和视觉由维护者人工验收。两端分别部署可回滚，旧 Sight 忽略新字段继续加载静态。

关联[目录设计](../design/modules/geo-ai-models.md)、[计划](../archive/plans/2026-10-19-ai-model-modes.md)。本决策扩展既有静态发布、建筑独立导出与局部播放决策，保留各自其余边界。
