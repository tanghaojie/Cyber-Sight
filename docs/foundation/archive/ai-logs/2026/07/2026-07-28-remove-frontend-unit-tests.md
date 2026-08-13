---
title: 移除前端单元测试
date: 2026-07-28
status: completed
---

# 移除前端单元测试

## 用户目标和约束

- 移除 `apps/frontend` 的所有单元测试。
- AI 不运行浏览器测试，测试工作由维护者负责。

## 关键问答与确认

无需额外确认；仓库现状可明确识别前端测试文件、配置和专用依赖。

## AI 的重要假设

- “所有单元测试”包括前端 `*.test.*`、Vitest 配置、测试脚本和仅供这些测试使用的依赖。
- 用户限制不影响前端格式检查、TypeScript 检查和生产构建，但这些检查不作为功能测试宣称。
- 后端、契约和数据库测试能力保留，只从根级监听命令中移除前端。

## 方案和执行摘要

- 用 ADR-0022 记录人工验收边界和自动化回归风险。
- 删除 14 个测试文件、前端 Vitest 配置、脚本与三项专用依赖，并更新 pnpm 锁文件。
- 移除仅为 Vitest CJS 包装保留的图标名称兼容分支。
- 同步测试策略、前端模块设计、仓库规则、维护指南和受影响的现行 ADR。

## 验证结果

- 静态清单确认前端测试文件、配置、脚本和专用直接依赖均已移除，根监听命令不含前端。
- 格式检查、Markdown 链接检查和 `git diff --check` 通过。
- 共享契约构建与前端 TypeScript/Vite 生产构建通过；只有既有非阻塞依赖警告。
- 按用户要求未运行任何测试或浏览器。

## 未决问题与下一步

前端人工验收范围由维护者在交付时决定；若未来恢复测试，应先复审 ADR-0022。构建中的
Sass legacy API 与第三方 PURE 注释警告可在独立依赖升级任务中处理。

## 相关设计、ADR、计划和提交

- `docs/design/testing-strategy.md`
- `docs/design/modules/frontend.md`
- `docs/decisions/ADR-0022-maintainer-owned-frontend-validation.md`
- `docs/archive/plans/2026-07-28-remove-frontend-unit-tests.md`
- 关联提交：本日志归档所在提交。
