---
title: Geo 模型制作与地理参考标准
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-03
updated: 2026-10-03
---

# Geo 模型制作与地理参考标准

## 目标与范围

将真实感优化划分为模型优化、场景优化。本轮交付详细制作标准，统一材质、UV、纹理、表面变化、坐标与参考系，并与现行加载器保持一致。主要作用域为 platform。

样本库七个独立 GLB 均无图像纹理，坐标字段不统一。用户明确要求先补充项目建模要求；沿用现行外部模型渲染和坐标选择能力。

补充模型制作设计、长期决策、Geo 相关入口及关联说明。场景优化登记分类和后续边界；不修改加载器、模型二进制、样本托管仓库、场景渲染或默认影像。

## 前置条件和风险

- 暂存区和工作区为空；开始归档审计为 NOT_DUE。
- 核对现行设计、ADR、模型准备/定位代码及 Cesium 1.144 支持与轴向转换。
- 扩展说明字段和外部定位文件不是新增功能，必须明确当前实际读取的字段。

## 实施任务

- [x] 按模型、场景两类明确职责与边界。
- [x] 补充材质、UV、纹理、表面变化、几何、夜景与导出要求。
- [x] 统一 WGS84、椭球高、米制锚点、轴向及字段示例。
- [x] 记录旧样本迁移、资产交付和人工验收清单。
- [x] 同步设计、ADR、索引，完成验证与记录归档。

## 测试与验证

本轮只有 Markdown，执行格式检查、文档链接与归档门禁、diff 审查；核对代码中的字段、定位、太阳和扩展支持。按 AGENTS.md 不创建或运行前端/浏览器测试。文档检查不代表模型重导出或 GPU 视觉验收。

实际结果：pnpm format:check、pnpm docs:archive:check:ci（NOT_DUE）、git diff --check 通过；JSON 示例可解析，坐标字段与当前解析器一致，列出的扩展支持与锁定引擎源码一致。最终归档路径和链接再次检查。

## 发布与回滚

按现有授权提交并更新工作分支，通过现有草稿 PR 审阅。回滚本轮文档提交即可。

## 实际偏差和遗留问题

无实现范围偏差，本轮只完成标准及关联文档。源模型重制、旧字段迁移、自动质量版本选择、真实场景和反射另行实施。关联基线为 eb4e985；本轮由 docs(geo): define model authoring and georeference standard 提交记录。

## 关联

- [制作标准](../../design/modules/geo-model-authoring.md)
- [决策](../../decisions/ADR-20261003-geo-model-authoring-and-georeference.md)
- [协作记录](../ai-logs/docs/2026/10/2026-10-03-geo-model-authoring-standard.md)
