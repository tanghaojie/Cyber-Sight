---
title: AI 日志与 Git 提交分类
scope: foundation
repository: Cyber-AI-Forge
owner: project maintainers
status: accepted
date: 2026-09-03
---

# ADR-20260903-ai-log-and-commit-classification：AI 日志与 Git 提交分类

## 背景

AI 协作记录按年月持续积累，主题检索需要扫描大量文件。Git 提交已经部分使用 Conventional Commit
标题，但没有允许类型的统一约束，也没有本地或远端自动校验。Forge 的 Foundation 规范、模板和工具会
同步到业务平台，规则必须区分可同步内容与下游保留的 Platform 内容。

## 决策驱动因素

- 按变更目的快速定位活动与归档协作记录。
- 让日志分类与提交分类使用同一组稳定术语。
- 不以整理为由破坏历史链接或重写已共享的 Git 历史。
- 为未安装本地 hook 或绕过本地 hook 的提交保留远端门禁。
- 使下游能够同步 Foundation 规则，同时保留 Platform 文档的所有权。

## 考虑的方案

1. 只在文档中约定类型：成本低，但没有机器校验，容易再次漂移。
2. 一次性移动全部历史日志并重写链接：目录整齐，但改变大量历史路径，归档内部链接也没有自动检查。
3. 新日志开始分类、保留历史路径，并以本地 hook 和远端检查验证新提交：兼顾可检索性、可追溯性和渐进接入。

## 决策

采用方案 3。

- 新 AI 日志路径为 `docs/<scope>/ai-logs/<change-type>/YYYY/MM/`，完成后移至同样分类的 archive 路径。
- `change-type` 限定为 `chore`、`docs`、`feat`、`fix`、`refactor`、`style`、`test`、`ci`、`build`、`revert`，并写入日志 frontmatter 的 `change_type`。
- 新 Git 提交必须使用 `<type>(<scope>)?!: <summary>`；scope 与破坏性变更标识可选。
- `scripts/git/commit-message.mjs` 同时服务于 `commit-msg` hook、手工范围检查和 GitHub 工作流。
- 规则从 2026-09-03 起只约束新创建的日志与提交。历史文件、历史链接和历史提交保持不变。
- 下游接收 Foundation 文档、模板、hook 配置和校验脚本；下游维护者更新自己保留的 `docs/platform/**` 并启用远端检查。

## 正面结果

- 日志可以先按变更类型、再按日期浏览和搜索。
- 提交标题可被机器解析，并与协作记录使用同一语义。
- 历史证据不因目录治理而被大规模改写。
- 本地与远端两层校验减少规则只停留在文档中的风险。

## 负面结果与风险

- 一个任务可能包含多个提交类型，日志必须选择主要交付而不是机械映射每个提交。
- 未受保护的分支仍可能通过直接推送绕过远端工作流；维护者必须配置必需状态检查。
- 同步不会写入下游 `.git/hooks`，下游需要执行 `pnpm prepare` 或 `pnpm install`。
- Integration 文件冲突、未登记的校验脚本路径或下游 Platform 文档未更新都会阻断或削弱接入。

## 验证和复审条件

- 单元测试覆盖允许与拒绝的提交标题。
- 同步测试确认新校验脚本与工作流路径已归为 Integration。
- `pnpm commit:check -- <base>..HEAD` 能验证指定范围，hook 能拒绝无效单次提交。
- `pnpm docs:archive:check:ci`、格式、lint、测试与构建通过。
- 一个下游在同步后保留 Platform 内容、安装 hook，并把远端检查设为分支保护条件。

## 相关设计和计划

- `docs/foundation/design/documentation-governance.md`
- `docs/foundation/design/developer-workflow.md`
- `docs/foundation/design/foundation-platform-ownership.md`
- `docs/foundation/archive/plans/2026-09-03-ai-log-and-commit-classification.md`
