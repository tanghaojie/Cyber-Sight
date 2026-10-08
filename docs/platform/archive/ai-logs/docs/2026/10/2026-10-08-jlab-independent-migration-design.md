---
title: 桀士排版独立迁移设计与计划编制
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-08
status: completed
change_type: docs
---

# 桀士排版独立迁移设计与计划编制

## 用户目标和确认

用户要求制定设计和实施计划，有问题向其确认。已确认仓库/目录 JLabWeChatEditor，产品桀士排版、英文 JLab WeChat Editor；完整保留功能/UI，采用 CoAIForge 0.2.0 工具链验证兼容；不迁旧浏览器数据，首开空原稿，保留默认配色/排版；先交付可静态部署应用，部署平台/域名尚未定。

## 事实与方案

来源 HEAD 64a67f2fdcec0df8b2012359237e1aa8bd813216，开始时暂存区和工作区为空。读取当前产品/UI/存储/模块设计、适用 ADR 及定向源码/工程配置。CodeGraph 返回无可用索引，回退普通工具，未创建索引。未使用旧 memory 作为迁移事实依据。

业务六模块未发现外部应用/契约导入；工程依赖根配置和锁文件。目标保留 apps/frontend，改为 src/modules，登记公共文件、依赖、六模块设计与 app.config 组装文件；兼容验证工具链与业务依赖；保持 origin 隔离、存储协议和人工验收边界。已编写设计、计划与用户确认的长期决策，仅修改 Platform 文档。

源应用保留、不双向自动同步；目标父目录、远端/分支实施前核对。本轮不生成工程、迁代码、搬数据、推送或部署。CI/浏览器/公众号验收列为未来步骤，不写成本轮执行结果。

## 验证结果

任务前 git diff --cached --quiet 通过。pnpm docs:archive:check 初次遇到 sandbox workspace realpath EPERM；正常环境重跑通过，Platform NOT_DUE，Foundation INHERITED、Forge EXCLUDED。未为环境错误修改依赖或代码。

pnpm format 与 format:check 通过，未改变源代码或非本任务文档；git diff --check 通过，最终归档 CI 为 NOT_DUE。对三份交付文档、归档日志和五份相关索引共 9 个文件检查 329 条相对链接，无断链。默认 Python 入口不可用，链接检查改用现有 Node，未安装工具。只运行本轮文档所需检查，未运行产品构建或浏览器测试。

本轮使用开发者上下文明确提供的 GPT-6 模型名称写入提交 trailer。文档提交及 trailer 在创建后用 git log 核验；具体 SHA 从本文件 Git 历史追溯，不写未来提交占位。

## 关联与下一步

- [设计](../../../../../design/apps/jlab-wechat-editor-migration.md)
- [计划](../../../../../plans/active/2026-10-08-jlab-independent-migration.md)
- [ADR](../../../../../decisions/ADR-20261008-jlab-independent-repository.md)

本次规划已完成并归档此日志，未来迁移计划保持 planned；实际实施在目标接续。关联提交以本文件 Git 历史中的 docs(platform) 规划提交为准，不写尚未存在的 SHA。
