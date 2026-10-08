---
title: 桀士排版迁入独立仓库并采用 CoAIForge 工具链
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: accepted
date: 2026-10-08
---

# ADR-20261008-jlab-independent-repository

## 背景与选择

独立协作模板及 CLI 阶段已由 CoAIForge 实施，维护者要求制定桀士排版独立迁移设计和计划，并确认目标仓库/目录为 JLabWeChatEditor。现有应用已是纯前端独立 apps workspace，但工程治理、根配置与锁文件仍归 Cyber-Sight。

可选方式为继续在原 monorepo 内交付、复制旧工程配置后另行升级，或使用 CoAIForge 前端工程迁入业务。维护者选择第三种，接受逐项验证工具链和业务依赖兼容性。

## 决策

1. 中文产品名沿用桀士排版，英文沿用 JLab WeChat Editor；仓库与目录名为 JLabWeChatEditor。
2. 完整保留现有功能与界面，采用 CoAIForge 0.2.0 frontend 工具链与单项目治理；业务进入 src/modules，不继承 Forge/Foundation/Platform 所有权或上游同步关系。
3. 不迁移旧浏览器数据。首次原稿为空，保留默认配色与排版设置；仍提供既有本地保存和主动文章版本功能。
4. 本阶段交付可静态部署的应用，部署平台与域名未定，正式发布另行确认。
5. 本轮只交付设计与计划，不提前执行代码搬迁或源应用删除。源应用保留用于对照，删除或正式入口切换需另行明确授权。

## 影响与复审

独立工程减少对来源配置与协作身份的依赖，但需维护自己的版本、依赖锁、文档、模块边界、CI 和真实归档基线。工具链大版本变化必须验证，不能用关闭检查代替兼容性处理。跨 origin 后新旧数据分离，无自动合并和回滚。

此决策不废弃源应用现行纯前端、桌面工作台和配置/文章分离存储决策，也不改变 Cyber-Sight 下游身份。新增后端、云同步、旧数据迁移、改变产品功能/UI、源删除或模板自动升级时，重新审查范围及相应决策。

## 关联

- [迁移设计](../design/apps/jlab-wechat-editor-migration.md)
- [实施计划](../plans/active/2026-10-08-jlab-independent-migration.md)
- [独立应用决策](ADR-20261004-jlab-wechat-editor-standalone-app.md)
- [存储决策](ADR-20261005-jlab-local-storage-history.md)
