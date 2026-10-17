---
title: 建筑建模与飞入拼装要求同步
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-17
updated: 2026-10-17
---

# 建筑建模与飞入拼装要求同步

## 目标

读取维护者引用的「Blender建筑爆炸动画」会话，把建筑从无到有、构件逐步飞入拼装的目标补入现行制作规范，并在 AIModels 提供可独立使用的完整建模要求和逐项目任务书。

## 背景与设计依据

主作用域为 Platform。依据现行模型制作、统一渲染、DEV 拼装预览和 AIModels 静态发布设计；不涉及 Foundation 或 Forge 修改。引用会话 ID 为 `6ad2cbc7-5560-83e9-a3c3-6afb06ff711e`。

## 范围

- Cyber-Sight：更新制作标准、补充分件与动画制作设计、ADR、索引及本次记录。
- AIModels：完整的材质、照明、几何、部件、定位、动画、导出及验收要求，任务书模板和建模入口指引。

## 非目标

本次交付规范，不制作建筑、改动 GLB/Blender 工程、增加播放器或修改发布协议。

## 前置条件和风险

- 两仓库初始暂存区为空，工作区干净；Cyber-Sight 归档审计为 NOT_DUE。
- 会话中可读取两条用户原文；助手答复仅返回内容引用，不能据此恢复或声称取得可运行脚本。
- 新参数是本次制作约定或建议值，不能归因为原会话已确认参数。
- 动画附录不是运行时 Schema，目录发布 v1 没有动画资源发现/控制字段。

## 实施任务

- [x] 读取会话、当前 Design/ADR、发布协议和目录结构。
- [x] 明确静态成品、爆炸分解和飞入拼装的制作契约与兼容边界。
- [x] 同步 AIModels 完整规范与逐项目任务书。
- [x] 核对文档、示例 JSON、相对链接、格式和发布清单未变。
- [x] 完成归档 CI，归档计划与日志；提交按本文件 Git 历史追溯。

## 测试与验证

仅执行文档格式、修改文件链接/示例检查、AIModels 既有发布清单检查及 Cyber-Sight 归档 CI。没有前端实现变化，不运行前端/浏览器自动化，也不以文档检查声称动画视觉验收完成。

实际结果：`pnpm format`、`pnpm format:check` 通过；AIModels 六份变更文档使用同一 Prettier 配置检查通过。11 份 Cyber-Sight 及 6 份 AIModels Markdown 的 323 个本地链接、4 个 JSON 示例检查通过；共同标准/日期、示例帧秒换算及构件时序检查通过。AIModels `python tools/catalog/publish.py --check` 仍为 8 个模型、134 个模型/依赖文件通过。`git diff --check` 通过，两个工作区变更均仅 Markdown；归档 CI 为 NOT_DUE。

## 发布与回滚

两仓库分别创建文档提交。没有发布或推送要求；回退时按本次提交恢复规范，不修改既有模型。

## 实际偏差和遗留问题

原会话助手脚本正文不可读取，明确保留该来源限制；可读用户目标已落实为两仓库规范。具体建筑资料、脚本运行和最终动画效果在后续建模任务验收，本次没有未完成的模型/运行时实现。

## 相关设计、ADR 和 AI 日志

- [制作标准](../../design/modules/geo-model-authoring.md)
- [分件与动画制作](../../design/modules/geo-model-assembly-authoring.md)
- [制作决策](../../decisions/ADR-20261017-building-assembly-authoring.md)
- [协作记录](../../archive/ai-logs/docs/2026/10/2026-10-17-building-modeling-requirements.md)
