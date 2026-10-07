---
title: 独立 AI 协作启动模板 P0 设计整理
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-07
updated: 2026-10-07
---

# 独立 AI 协作启动模板 P0 设计整理

## 目标与范围

将维护者已确认的启动模板方案写入正式设计、提取清单、ADR 和 P1 实施计划。本次只修改 Cyber-Sight 的 Platform 文档；目标模板不含任何所有权 scope，当前来源仓库仍执行现行治理规则。

基线提交：`19646b40de73e114bf5447cfc14166af2c84bb47`。开始时暂存区和工作区均为空；归档审计为 Platform NOT_DUE、Foundation INHERITED、Forge EXCLUDED。

## 非目标

不创建独立仓库，不实施模板代码或 CLI，不发布 npm 包，不迁移 Geo/桀士排版，不修改 Foundation、根 AGENTS.md、工程脚本或当前归档台账。

## 实施任务

- [x] 核对用户逐项确认、现行目录、公共文档模板和来源文件。
- [x] 编写正式设计及来源提取清单，分清已接受目标与未实施能力。
- [x] 新增长期决策 ADR，形成尚未实施的 P1 计划。
- [x] 更新设计、决策、活动计划和协作记录索引。
- [x] 执行文档格式、链接、差异与归档 CI 检查。
- [x] 记录验证结果，归档本计划和本轮 AI 日志；本轮文档随本计划所在提交交付。

## 验证与回退

执行文档格式检查、相对链接与来源路径检查、`git diff --check`、`pnpm docs:archive:check:ci`。本轮无代码改动，不执行前端自动化测试、浏览器验收或应用构建。只暂存本轮列明的文档；回退仅针对本轮文档提交，不影响现有应用。

## 实际偏差和遗留问题

`pnpm format:check`、`git diff --check` 与 `pnpm docs:archive:check:ci` 通过。首次审计发现新日志的五处相对链接多退了一层，修正后恢复 NOT_DUE；来源现行文档未修改，归档台账未推进。归档后对本轮 11 份文档核验 274 个相对链接和 27 个来源路径，全部存在；P1 状态及未勾选任务检查通过。

P1 保持 draft/not_started，未执行模板安装、启动、构建、后端/契约测试、人工前端验收或 CLI 发布。新仓库与实施前选择列于 P1，属于后续工作而非本轮漏项。本次无范围偏差。

关联提交为包含本文件的 `docs(platform): define independent AI collaboration starter P0`，通过本文件 Git 历史定位；不把未创建的提交 SHA 写入文档或台账。

## 关联

- [正式设计](../../design/ai-collaboration-starter.md)
- [提取清单](../../design/ai-collaboration-starter-extraction.md)
- [长期决策](../../decisions/ADR-20261007-independent-ai-collaboration-starter.md)
- [P1 实施计划](../../plans/active/2026-10-07-ai-collaboration-starter-p1.md)
- [AI 协作记录](../ai-logs/docs/2026/10/2026-10-07-ai-collaboration-starter-p0.md)
