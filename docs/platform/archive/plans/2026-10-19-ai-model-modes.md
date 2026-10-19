---
title: AIModels 模式与精细度声明适配
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-19
updated: 2026-10-19
---

# AIModels 模式与精细度声明适配

## 目标与范围

按维护者要求，在 AIModels 声明静态、飞入拼装、爆炸分解及各模式的精细度，Sight 外部数据按声明展示与加载。主要作用域为 Platform Geo；协同修改独立 AIModels 的发布工具、配置及规范，不修改 Foundation、后端、资产二进制或场景时钟。

## 设计依据与兼容

见 [目录设计](../../design/modules/geo-ai-models.md)及[兼容扩展 ADR](../../decisions/ADR-20261019-ai-model-modes.md)。保留 v1 的静态 model/variants，新增可选 modes、defaultMode、defaultVariant。缺省为静态、原始版；已有 variants 保留。模式变更后重新选择该模式的默认精细度，点击加载才替换整组，不自动播放。

## 实施任务

- [x] AIModels 规范、生成、校验及负向/兼容测试；为望京声明飞入与爆炸，国家大剧院保留三档。
- [x] Sight 解析与默认规则、双选择器、模式和精细度联合加载身份及资源释放。
- [x] 格式、TypeScript/生产构建、ESLint、模块边界、归档 CI；复核协议与生成文件。
- [x] 补充验证和人工验收边界，归档计划与日志；随本次功能提交交付。

## 风险与验证

仅显示真实存在的组合，显式无效默认值和未知模式拒绝；旧目录缺字段可加载。目录/描述部署不一致时加载报错并提示刷新。沿用已有整组重载，开始替换后失败/取消清理新资源，不恢复旧组。动画播放复用普通 GLB 播放器；不创建或运行前端/浏览器自动化，实际播放、昼夜、定位、取消与重新加载由维护者人工验收。

## 发布与回滚

AIModels 输出保留旧字段，旧 Sight 仍读取静态；新 Sight 兼容旧目录，可分别部署。回滚配置与消费者提交即可恢复静态目录，旧动画二进制保持原样。本次任务未要求推送或部署。

## 实际结果

AIModels 提交 c2a1200，13 项发布工具测试及 9 模型/139 文件完整发布校验通过。Sight 共享契约构建、前端 TypeScript/生产构建、修改文件 ESLint、全仓格式、模块边界与归档 CI 检查通过，未运行前端或浏览器自动化。按设计保留整组重载；没有无缝替换、缓存或自动播放。重新打开面板优先回显已加载组合，刷新后不存在的选择回退到声明默认。

环境未安装 RTK，使用原生工具；初始两仓库干净，暂存区门禁通过，归档审计 NOT_DUE。实际 GPU、首次下载、动画、定位和交互由维护者人工验收。关联 Sight 提交为 `feat(geo): select published model modes and precision`，本计划和[协作记录](../ai-logs/feat/2026/10/2026-10-19-ai-model-modes.md)随同提交，可按文件历史追溯。未推送或部署。
