---
title: AI 日志与 Git 提交分类实施
scope: foundation
repository: Cyber-AI-Forge
owner: project maintainers
status: completed
created: 2026-09-03
updated: 2026-09-03
---

# AI 日志与 Git 提交分类实施

## 目标

让新 AI 日志按允许的变更类型存放，并让新 Git 提交接受本地与远端的同一分类校验；不移动历史日志或重写历史提交。

## 背景与设计依据

依据 `documentation-governance.md`、`developer-workflow.md`、`foundation-platform-ownership.md` 和
ADR-20260903。Foundation 文档与模板会下游同步，Platform 文档和 Git hooks 仍需要下游维护者接入。

## 范围

- 更新 Foundation 治理、模板、AI 规则和维护者指南。
- 新增允许类型的提交标题校验、hook 配置、范围检查与 GitHub 工作流。
- 为同步清单和自动化测试登记新 Integration 路径。

## 非目标

- 批量移动既有 AI 日志或改写归档链接。
- 改写既有 Git 提交。
- 自动配置下游的分支保护规则。

## 前置条件和风险

- 下游需要执行 `pnpm prepare` 安装新 hook，并手工将远端检查设为必需。
- `docs/platform/**` 在同步时保留，需由下游各自更新。
- 新脚本和工作流必须列入 `.forge-sync.yml`，否则同步拒绝未知路径。

## 实施任务

- [x] 建立设计、ADR、计划与 AI 协作记录。
- [x] 更新 AI 日志目录、模板与维护者规则。
- [x] 实现提交标题校验、hook、范围检查和远端工作流。
- [x] 补充同步与校验测试，完成验证与归档。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm docs:archive:check:ci`
- `pnpm commit:check -- HEAD~1..HEAD`（在最终提交后验证）

## 发布与回滚

同步到下游后先运行 `pnpm prepare`，再将 `Verify commit convention` 设为必需检查。若需要撤销，恢复规则与
hook 配置即可；历史日志没有移动，无需数据回迁。

## 实际偏差和遗留问题

历史日志保持原路径，未产生大规模重命名或链接迁移。`pnpm format`、`pnpm test` 与 `pnpm build`
在执行实际脚本前被当前 pnpm 的 `@scarf/scarf` 忽略构建许可策略阻断；本次文件已使用仓库
Prettier 配置检查和格式化，ESLint、全部 Node 工具测试、提交标题范围校验、归档 CI 和 diff 检查通过。
下游分支保护不能由 Forge 自动配置，仍需要接入维护者把 `Verify commit convention` 设为必需检查。

## 相关设计、ADR 和 AI 日志

- `docs/foundation/decisions/ADR-20260903-ai-log-and-commit-classification.md`
- `docs/foundation/archive/ai-logs/chore/2026/09/2026-09-03-ai-log-and-commit-classification.md`
