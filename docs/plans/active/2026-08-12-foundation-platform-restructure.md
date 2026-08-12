---
title: Forge Foundation/Platform 结构迁移
scope: foundation
repository: Cyber-AI-Forge
owner: project maintainers
status: active
created: 2026-08-12
updated: 2026-08-12
---

# Forge Foundation/Platform 结构迁移

## 目标

将仓库重构为 `forge`、`foundation`、`platform` 三个明确所有权作用域，使 Forge 能持续同步共享基础，而 Sight 等业务平台只修改 Platform。

## 背景与设计依据

当前 `system`/`biz` 分类未覆盖契约、数据库、应用壳、品牌和文档；推广站与根 README 还会参与下游全仓合并。用户确认 Sight 没有业务表、Drizzle migration 或需要保留的数据，允许重建空库基线。

## 范围

- 三层文档生命周期与公共模板。
- API 契约、前端、后端、数据库 Schema 和迁移目录。
- Platform 配置与品牌覆盖入口。
- Forge 推广站和 README 资产隔离。
- 路径所有权、单向依赖检查和下游同步工具。
- Forge 完整验证和临时仓库同步场景。

## 非目标

- 不修改现有 HTTP 数据结构或业务行为。
- 不保留旧数据库或旧 migration journal 的升级能力。
- 不创建前端自动化或浏览器测试。
- 本仓库任务不直接修改 Cyber-Sight；Sight 迁移在 Forge 结构稳定后另行执行。

## 前置条件和风险

- 每次提交前保持人类改动优先，无法隔离的既有改动立即停止。
- 数据库双链先验证跨作用域外键生成；失败时 Platform 使用 custom migration。
- 大规模移动必须分阶段构建，避免一次性积累不可定位错误。
- `foundation` 表示共享平台基础，不修改现有 `sys_` 物理表前缀。

## 实施任务

- [x] 暂存区门禁、工作区检查与文档归档审计。
- [x] 建立总体设计、所有权 ADR、数据库迁移 ADR、计划和 AI 日志。
- [ ] 将文档重组为 Foundation、Forge、Platform 完整生命周期，保留公共 `docs/templates`。
- [ ] 更新模板 frontmatter，加入 scope、repository 和 owner。
- [ ] 迁移 API 契约到 `foundation/platform`，清理遗留模块 `index.ts`。
- [ ] 增加目录和 Foundation 单向依赖检查。
- [ ] 迁移前端 Foundation、Platform 和稳定组合入口。
- [ ] 迁移后端 Foundation、Platform 和 `PlatformModule`。
- [ ] 建立 Platform 品牌、链接、存储、JWT、首页和 About 配置入口。
- [ ] 拆分数据库 Schema、Drizzle 配置和迁移历史，生成空库 Foundation 基线。
- [ ] 将推广站与 Forge README 资产迁入 `forge/`，更新 Pages 工作流。
- [ ] 实现 `.forge-sync.yml`、同步命令、差异报告和临时 Git 仓库测试。
- [ ] 更新所有相关现行设计、索引、指南和仓库规则。
- [ ] 执行格式、Lint、测试、构建、文档与适用数据库验证。
- [ ] 复核最终 diff，归档计划和 AI 日志并创建带 AI trailer 的提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm docs:archive:check:ci`
- Foundation/Platform 结构和单向依赖检查。
- 空 PostgreSQL 18 可用时执行两条迁移与 `pnpm test:db`；不可用时明确记录环境边界。
- 前端登录、首页、菜单、语言、品牌和主题由维护者人工验收。
- 同步测试覆盖 README、Foundation、Platform、Forge、未知路径和验证失败。

## 完成记录

实施中持续更新实际偏差、验证结果、未决问题和关联提交。
