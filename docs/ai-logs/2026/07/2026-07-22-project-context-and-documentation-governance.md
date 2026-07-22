---
title: 项目背景确认与文档治理
date: 2026-07-22
status: completed
---

# 项目背景确认与文档治理

## 用户目标

- 将项目同时用于个人通用脚手架和团队统一模板。
- Fastify/TypeScript 作为当前后端，保留未来切换 Java 的可能。
- AI 既要快速生成业务，也必须受到测试、契约校验和架构规则约束。
- 在仓库中记录模块设计、AI 实施计划和 AI 沟通过程，方便后续回溯。

## 已确认背景

- Java 是预留方案，最初担心部分功能无法用 TypeScript 实现；当前不要求维护双后端。
- 原 `docs/` 只有 Superpowers 生成的实施计划，没有稳定的设计文档和统一文档生命周期。
- 仓库当前是最小概念验证，OpenAPI 契约、Fastify Schema 和 Zod Schema 仍有重复。

## 本次方案

- 建立 Design、ADR、Plan、AI Log 四类文档及模板。
- 将原始 Superpowers 计划保留并移入统一的历史计划目录。
- 使用根 `AGENTS.md` 强制 AI 在非简单改动前后维护文档。
- AI 日志保存结构化摘要，不默认保存完整聊天或敏感内容。

## 结果

- 新增系统、API、后端、前端和文档治理设计。
- 新增 OpenAPI 跨实现契约 ADR。
- 新增文档模板、索引和计划生命周期。
- 后续仍需用 CI 和契约测试把行为规则升级为机器可验证的门禁。

## 相关文档

- `docs/design/system-overview.md`
- `docs/design/documentation-governance.md`
- `docs/decisions/ADR-0001-openapi-as-cross-implementation-contract.md`
- `docs/plans/archive/2026-07-22-documentation-governance.md`
