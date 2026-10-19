---
title: AIModels 模式与精细度声明适配
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-19
status: completed
change_type: feat
---

# AIModels 模式与精细度声明适配

## 用户目标和约束

维护者要求修改 AIModels，增加模式与精细度声明，未声明使用默认配置；Sight 同步适配。没有要求重新制作模型或自动播放。遵守前端人工验收边界。

## 方案与假设

兼容扩展 v1，静态 model 与精细度 variants 保留；modes 声明额外 assembly/explode 文件及各自 variants。defaultMode 缺省 static，各模式 defaultVariant 缺省 original。缺失可默认，声明错误必须报错，不假造精细度/动画。望京复用已发布的两种动画文件。

## 执行与验证

初始 Sight ba0b3ca、AIModels bc5be67，工作区与暂存区均为空；拉取未产生新差异。首次修改前文档归档审计 NOT_DUE。设计和计划先于代码；AIModels 使用稀疏检出补齐发布校验需要的资产。

AIModels c2a1200 已提交，13 项发布工具测试通过，完整生成及 check 覆盖 9 个模型、139 个模型/依赖文件；已验证动画文件摘要和各模式精细度的独立性。仅望京、国家大剧院源配置显式增加声明，其余源配置缺省，由发布器补齐默认值；无二进制变更。

Sight 完成模式/精细度解析、双选择器、默认/失效选择回退、面板重开回显和加载身份适配，复用既有整组释放与播放器。共享契约构建、前端 TypeScript/生产构建、修改文件 ESLint、模块边界、全仓格式和归档 CI 检查通过；只做工程检查，没有创建或运行前端/浏览器自动化。构建有既有 Sass legacy API 和大 chunk 提示，无构建错误。

## 遗留边界与提交

整组重载（含街区）沿用既有策略，替换后失败/取消不恢复旧组；没有新增无缝切换、缓存或自动播放。实际播放、下载/GPU 成本、昼夜、定位、取消、重复加载和 1280×720 布局待维护者人工验收。两仓库本地提交，未推送或部署；Sight 提交为 `feat(geo): select published model modes and precision`，按本文件历史追溯。

关联[计划](../../../../plans/2026-10-19-ai-model-modes.md)、[设计](../../../../../design/modules/geo-ai-models.md)、[ADR](../../../../../decisions/ADR-20261019-ai-model-modes.md)。
