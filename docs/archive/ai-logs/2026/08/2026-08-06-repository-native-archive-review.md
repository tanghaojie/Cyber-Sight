---
title: Repository-native documentation reconstruction and archive review
date: 2026-08-06
status: completed
---

# Repository-native documentation reconstruction and archive review

## User goal and constraints

The user authorized implementation of an automatic documentation reconstruction and archive
review mode. Multiple AI agents may work in the repository, so the protocol must not depend on a
Codex-specific marker such as `.codex/archive-pending.json`.

## Key decisions

- Use a repository-native `pnpm docs:archive:check` command.
- Use `docs/plans/active/` as the shared, visible task queue.
- Store policy and review baselines in versioned JSON files under `docs/archive/`.
- Reconstruct current documentation from code, tests, contracts, migrations, and Git history
  before archiving replaced Design and ADR content.
- Do not invent human intent when repository evidence is insufficient.

## Assumptions

- The existing repository baseline commit is `a81c7437894e4b17871a026b161cd1f19348e4ea`.
- A deterministic audit should remain read-only and should not invoke an AI runtime from Git hooks.
- The current task changes governance and tooling only; it does not change application behavior.

## Implemented changes

- Added `scripts/docs/archive-audit.mjs`.
- Added `docs/archive/archive-policy.json` and `docs/archive/archive-ledger.json`.
- Added ADR-0030 and the active implementation plan.
- Added the package command, startup instructions, validation results, and final archive transition.

## Verification results

- `pnpm format` and `pnpm format:check` passed.
- `pnpm lint` passed with the workspace Node runtime.
- `pnpm docs:archive:check -- --json` returned `IN_PROGRESS` while this plan was active and found
  no broken documentation links.
- `pnpm build` passed, including API contract, backend, and frontend production builds.
- `pnpm test` passed with 14 test files and 120 tests.
- `git diff --check` passed.

## Final state

The implementation plan and this AI log are ready to move into the corresponding archive paths.

## Open issues

- None at the start of implementation. Any broken current-document links or ambiguous historical
  intent discovered by validation must be recorded rather than silently rewritten.
