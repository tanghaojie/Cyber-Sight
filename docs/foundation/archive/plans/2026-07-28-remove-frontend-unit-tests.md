---
title: 移除前端单元测试
status: completed
created: 2026-07-28
updated: 2026-07-28
---

# 移除前端单元测试

## 目标

移除 `apps/frontend` 的全部单元与组件测试资产，把前端功能和浏览器验收责任交给维护者，
同时保留前端格式、类型检查和生产构建能力。

## 背景与设计依据

维护者明确认为当前前端单元测试收益有限，并要求 AI 不运行浏览器测试。长期取舍记录在
ADR-0022，现行测试策略和前端模块设计同步收敛到人工验收边界。

## 范围

- 删除 14 个前端 `*.test.ts` 文件和 `vitest.config.ts`。
- 删除前端测试脚本及 Vitest、Vue Test Utils、jsdom 依赖并更新锁文件。
- 调整根命令、仓库规则、当前设计、维护指南和相关 ADR 的前端验证描述。
- 通过静态清单、格式检查和前端生产构建验证迁移结果。

## 非目标

- 不修改后端、契约或数据库测试实现。
- 不运行单元测试、集成测试、端到端测试或浏览器测试。
- 不改变任何前端业务行为。

## 前置条件和风险

- 任务开始时暂存区必须为空；已确认通过。
- 移除自动化测试后，前端回归发现依赖维护者人工验收。
- 锁文件仍会保留后端 Vitest 及其可选 peer 元数据，不能用关键字完全消失作为完成条件。

## 实施任务

- [x] 建立 ADR、设计、计划和 AI 协作记录。
- [x] 删除前端测试文件、配置、脚本和专用依赖。
- [x] 同步当前文档与既有 ADR 中的前端测试约定。
- [x] 完成不含测试和浏览器的静态验证及前端构建。
- [x] 归档计划与 AI 日志并创建带 AI trailer 的提交。

## 测试与验证

- 前端 `*.test.*` 文件为 0，`vitest.config.ts` 不存在。
- 前端没有 `test`/`test:watch` 脚本，也没有 Vitest、Vue Test Utils、jsdom 直接依赖；根级
  `test:watch` 不再调度前端。
- `pnpm format:check`、Markdown 链接检查（`MARKDOWN_BROKEN=0`）和 `git diff --check` 通过。
- `pnpm --filter @scaffold/api-contract build` 与 `pnpm --filter @scaffold/frontend build` 通过。
- 按用户要求未运行 `pnpm test`、任何单元/集成/端到端测试或浏览器测试。

## 发布与回滚

这是源码和开发依赖变更，不需要运行时迁移。回滚时还原本提交；若未来恢复自动化测试，
应先复审 ADR-0022 并重新选择高价值覆盖范围。

## 实际偏差和遗留问题

- 首次前端构建在受限 Windows 沙箱中因父目录读取权限失败；授权重跑后发现共享契约 `dist`
  是旧产物。先正常重建契约包，再重跑前端构建后通过。
- 构建报告既有 Sass legacy JS API 和第三方 PURE 注释位置警告，不影响产物，本任务未处理。
- 前端自动化回归能力已按维护者决策移除，人工验收结果由维护者负责。

## 相关设计、ADR 和 AI 日志

- `docs/design/testing-strategy.md`
- `docs/design/modules/frontend.md`
- `docs/decisions/ADR-0022-maintainer-owned-frontend-validation.md`
- `docs/archive/ai-logs/2026/07/2026-07-28-remove-frontend-unit-tests.md`
- 关联提交：本计划归档所在提交。
