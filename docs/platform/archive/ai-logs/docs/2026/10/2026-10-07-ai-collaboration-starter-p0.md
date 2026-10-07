---
title: 独立 AI 协作启动模板 P0 设计整理
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-07
status: completed
change_type: docs
---

# 独立 AI 协作启动模板 P0 设计整理

## 用户目标和约束

提炼项目经验，形成以 AGENTS.md 与 docs 为核心的独立启动模板，后续通过安装 CLI 交互创建项目。用户先要求只出方案，逐项选择后授权“进行下一项工作”，对应落地 P0 正式设计、提取清单和 P1 实施计划。本轮不实施模板代码。

## 已确认选择

- 不预设业务功能；交互选择前端、后端或全选。单选为空启动工程，全栈只有 health 示例。
- 前端 Vue 3/Vite/TypeScript，后端 NestJS/Fastify/TypeScript；全栈包含共享 Zod 契约与前端最小状态展示。
- 移除 Forge、Foundation、Platform scope，代码按模块组织，docs 使用单项目目录。
- 非简单改动先设计、计划和 AI 日志，长期决定写 ADR，完成后更新并归档。
- 验证通过后默认自动提交；用户明确暂不提交时除外，保留分类和真实模型 trailer。
- 前端静态检查与构建由 AI 执行，功能由人类验收；仅明确要求时新增或运行前端自动化测试。
- 保留自动归档审计并转为单项目；统一 pnpm workspace，版本经验证后固定。
- RTK、CodeGraph 为可选增强，不自动安装工具或建立索引。

## 假设与执行摘要

当前来源仓库规则不因目标模板去 scope 而变化，故筹备文档保存在 docs/platform。起始提交为 `19646b40de73e114bf5447cfc14166af2c84bb47`，暂存区、工作区为空，审计 NOT_DUE。源码定位先使用 CodeGraph，按需核对 health、契约和审计依赖。

发现归档审计直接依赖 forge-sync 的路径分类器；health Controller 引用授权装饰器，前端 health 引用共享 API 客户端和本地化。提取清单要求解除这些依赖，不能将完整管理基础一并带入新模板。

## 验证结果

本轮新建目标设计、提取清单、接受状态 ADR 和未启动 P1 计划，并完成 P0 文档计划与本日志归档、相关索引更新。全部改动限于 docs/platform。

`pnpm format:check`、`git diff --check`、`pnpm docs:archive:check:ci` 通过。首次归档 CI 因本日志五处相对链接层级错误报 DUE；修正后 Platform 为 NOT_DUE，Foundation 为 INHERITED、Forge 为 EXCLUDED。没有以修改台账绕过检查；归档后核验 11 份文档中的 274 个相对链接、27 个来源路径以及 P1 未启动状态，全部通过。

未执行模板安装、启动、构建、运行或 CLI 发布验证，未创建或运行前端自动化测试。相关证据均属于文档验证，不能用于宣称 P1 完成。

## 未决事项

独立仓库名称及路径、具体依赖版本留待 P1 启动与兼容验证；npm 包名、安装命令和发布方式留待 CLI 阶段。尚未创建新仓库或迁移应用。

## 关联

- [设计](../../../../../design/ai-collaboration-starter.md)
- [提取清单](../../../../../design/ai-collaboration-starter-extraction.md)
- [ADR](../../../../../decisions/ADR-20261007-independent-ai-collaboration-starter.md)
- [P0 计划](../../../../plans/2026-10-07-ai-collaboration-starter-p0.md)
- [P1 计划](../../../../../plans/active/2026-10-07-ai-collaboration-starter-p1.md)

关联提交为包含本文件的 `docs(platform): define independent AI collaboration starter P0`，通过本文件 Git 历史追溯。
