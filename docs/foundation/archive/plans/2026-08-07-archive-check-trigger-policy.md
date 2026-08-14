---
title: 按任务范围触发文档归档审查
status: completed
type: documentation-archive-review
scope: repository
created: 2026-08-07
updated: 2026-08-07
---

# 按任务范围触发文档归档审查

## 目标

承接当前归档审计报告的 `DUE` 状态，并将文档归档检查从每次 AI 任务启动改为按任务范围触发，同时保留合并前的自动化兜底。

## 背景与设计依据

- 初始 `pnpm docs:archive:check -- --json` 在旧基线后检测到架构变更，返回 `DUE`。
- 默认 Node 20 在受限执行环境中无法解析 `C:\Users\thj_3`，工作区提供的 Node 24 运行时可以正常执行同一审计脚本。
- 当前阈值和立即触发条件继续由 `docs/archive/archive-policy.json` 管理；本计划只调整检查时机和执行入口。

## 范围

- 更新 AI 启动规则、文档治理设计、活动计划说明和现行 ADR。
- 增加显式 CI/合并前检查脚本入口。
- 完成当前架构变更后的文档审查，更新归档台账。

## 非目标

- 不改变归档阈值、范围、立即触发条件或审计算法。
- 不把 Codex、Claude 或其他 AI 平台的私有缓存作为跨 AI 状态。
- 不为当前沙箱权限问题引入机器特定的 Node 路径配置。
- 不修改并行职位模块任务的实现、设计或提交内容。

## 实施任务

- [x] 确认暂存区为空并定位 Node/PNPM 执行环境错误。
- [x] 使用工作区 Node 运行时验证归档审计脚本。
- [x] 更新仓库规则、设计文档、ADR、索引和 CI 检查入口。
- [x] 等待并行职位模块提交完成，确认本次工作区变更可隔离。
- [x] 更新归档台账并将完成的计划和 AI 日志移入归档目录。

## 测试与验证

- `pnpm install`：清理残留 esbuild 进程和可再生 `node_modules` 后成功。
- `pnpm format`：通过。
- `pnpm format:check`：通过。
- `pnpm docs:archive:check -- --json`：职位模块提交后无 broken links，当前活动计划使状态为 `IN_PROGRESS` 且 `due: false`。
- `pnpm docs:archive:check:ci`：返回 0；活动计划完成归档后再次验证最终状态。

## 实际偏差和遗留问题

系统 Node 20 在受限沙箱中仍会因父目录权限返回 `EPERM`；该问题属于执行容器权限，项目不记录或依赖机器特定运行时路径。仓库依赖目录曾有残留的 esbuild 进程，已终止该进程并按锁文件重装可再生的 `node_modules`。

## 最终结果

归档检查现在按任务范围触发：只读问答、代码浏览、格式化、注释和单文件机械改动可跳过；业务、API、数据模型、模块、架构、迁移、ADR、计划或文档治理任务在首次修改前检查。新增 `docs:archive:check:ci` 作为 CI/合并前兜底。归档台账基线更新为职位模块提交后的当前 HEAD，完成的计划和 AI 日志已归档。

## 相关设计、ADR 和 AI 日志

- `docs/design/documentation-governance.md`
- `docs/decisions/ADR-0033-task-scoped-documentation-archive-audit.md`
- `docs/archive/ai-logs/2026/08/2026-08-07-archive-check-trigger-policy.md`
