---
title: Documentation archive review after architecture changes
type: documentation-archive-review
status: completed
scope: repository
created: 2026-08-07
updated: 2026-08-07
baseline_commit: 3a63ad81a2fb2b85a918f7a2bb426e9d497114f9
---

# Documentation archive review after architecture changes

## 目标

Review the repository-native documentation baseline after the archive check reported an architecture-change trigger, reconcile current documentation with the reviewed implementation, and archive only documentation that is demonstrably complete or superseded.

## 背景与设计依据

- `pnpm docs:archive:check` reported `DUE` with baseline `3a63ad81a2fb2b85a918f7a2bb426e9d497114f9`.
- Current repository policy is defined by `docs/archive/archive-policy.json` and `docs/archive/archive-ledger.json`.
- The current design and decision indexes are the source of truth for active documentation.
- The reviewed post-baseline changes are login appearance controls, frontend theme-color consistency, and a sidebar-only visual cleanup.

## 范围

- Review changes after the recorded baseline, their related current design documents, ADRs, plans, and AI logs.
- Update current documentation or archive superseded records only when the evidence supports it.
- Record the final review result in the archive ledger and indexes.

## 非目标

- Do not alter product behavior or application code.
- Do not rewrite historical records without evidence that they are superseded.
- Do not broaden this review to unrelated documentation improvements.

## 前置条件和风险

- Preserve human-authored changes and existing repository history.
- The README ordering request is a separate single-file documentation change and does not itself change the archive review scope.

## 实施任务

- [x] Review post-baseline commits and identify architecture/documentation changes.
- [x] Compare current code facts with active Design/ADR records; no additional current-document or ADR update is required.
- [x] Confirm the completed login-appearance and theme-color plans/logs are already archived; no current Design/ADR is superseded.
- [x] Update archive ledger and relevant indexes, then rerun the archive check.

## 测试与验证

- `pnpm docs:archive:check`: passed with `NOT_DUE` after the ledger update.
- `pnpm format`, `pnpm format:check`, and `git diff --check`: passed.

## 发布与回滚

Documentation-only changes can be reverted by restoring the reviewed files and ledger entry. No deployment or data migration is required.

## 实际偏差和遗留问题

The review found no additional superseded current Design/ADR or API, database, or runtime behavior change. The archive ledger was advanced from the recorded baseline to the reviewed current HEAD.

## 相关设计、ADR 和 AI 日志

- `docs/design/README.md`
- `docs/decisions/README.md`
- `docs/archive/archive-policy.json`
- `docs/archive/archive-ledger.json`
- `docs/design/modules/auth.md`
- `docs/design/modules/frontend.md`
- `docs/design/modules/settings.md`
- `docs/design/theme-color-consistency.md`
- Related commits: `894ff15`, `29108e7`, `334c213`
