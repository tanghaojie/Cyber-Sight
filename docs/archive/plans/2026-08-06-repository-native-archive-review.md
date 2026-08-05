---
title: Repository-native documentation reconstruction and archive review
status: completed
created: 2026-08-06
updated: 2026-08-06
type: documentation-archive-review
scope: repository
baseline_commit: a81c7437894e4b17871a026b161cd1f19348e4ea
---

# Repository-native documentation reconstruction and archive review

## Goal

Implement a cross-agent startup protocol that detects when documentation reconstruction and
archive review are due, without depending on Codex, Claude, or another AI platform's private
state directory.

## Scope

- Add a deterministic `pnpm docs:archive:check` audit command.
- Store thresholds and the last-review baseline in versioned repository files.
- Make `docs/plans/active/` the shared queue for archive-review work.
- Document startup behavior for all AI agents.
- Add a long-term ADR for the protocol.

## Non-goals

- Automatically invoke a specific AI runtime.
- Automatically infer undocumented human intent.
- Automatically archive Design or ADR files merely because a numeric threshold was reached.
- Change application behavior or API contracts.

## Implementation tasks

- [x] Add policy and archive-ledger files.
- [x] Implement Git/document audit script.
- [x] Add package command and startup protocol documentation.
- [x] Add ADR-0030 and update governance documentation.
- [x] Run formatting, audit, build, and document consistency checks.
- [x] Record final verification and archive this plan with its AI log.

## Verification

- `pnpm docs:archive:check`
- `pnpm docs:archive:check -- --json`
- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm build`
- `pnpm test`

The frontend remains subject to the repository's manual browser-acceptance boundary; this task
does not add or run frontend browser automation.

Actual verification results:

- `pnpm format` and `pnpm format:check` passed.
- `pnpm lint` passed with the workspace Node runtime.
- `pnpm docs:archive:check -- --json` returned `IN_PROGRESS` while this plan was active, with no
  broken documentation links.
- `pnpm build` passed, including API contract, backend, and frontend production builds.
- `pnpm test` passed: 14 backend test files and 120 tests.
- `git diff --check` passed.

## Related records

- [Documentation governance](../../design/documentation-governance.md)
- [ADR-0030](../../decisions/ADR-0030-repository-native-documentation-archive-review.md)
- [Archive index](../../archive/README.md)
