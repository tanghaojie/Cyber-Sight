---
title: Repository-native documentation archive review follow-up
date: 2026-08-06
status: active
---

# Repository-native documentation archive review follow-up

## User goal and constraints

- User identified that the `DUE` result should create an active archive-review plan.
- The repository protocol requires a shared plan under `docs/plans/active/` rather than an
  AI-platform-specific marker.
- Historical documents must not be moved without evidence that they are superseded.

## Key decisions and confirmations

- The repository baseline remains `dbd6d4ad520de99b58f1d7fbb2b8d10320e12f53`.
- The baseline review time remains `2026-07-29T18:15:02+08:00`.
- No archive move is performed during plan creation.
- The new plan uses `type: documentation-archive-review` and `scope: repository` so future
  agents can continue it when the audit reports `IN_PROGRESS`.

## Important assumptions

- The current implementation, tests, contracts, migrations, and human-authored documents are
  authoritative over historical plans and AI logs.
- The archive audit's `DUE` status is a trigger for review, not permission to automatically
  delete or move every historical document.

## Actions and result

- Confirmed the staged area was empty before writing.
- Confirmed no existing repository-scoped archive-review plan was present in
  `docs/plans/active/`.
- Created the active plan:
  `docs/plans/active/2026-08-06-repository-native-archive-review-follow-up.md`.
- Created this active collaboration log.

## Verification

- `pnpm docs:archive:check` currently reports `DUE`.
- Trigger evidence: 48 effective commits, 6 accepted ADRs, 34 completed features, and an
  architecture change.
- The plan and log still require formatting and final archive-review validation before they
  are committed.

## Open questions and next steps

- Complete the evidence-based inventory and classify candidate historical documents.
- Identify any current Design or ADR content that must be updated before archival.
- Record maintainer confirmation for unresolved intent.
- Complete validation, then archive the plan and log together with the reviewed evidence.

## Related design, ADR, plan, and commit

- `docs/design/documentation-governance.md`
- `docs/decisions/ADR-0030-repository-native-documentation-archive-review.md`
- `docs/plans/active/2026-08-06-repository-native-archive-review-follow-up.md`
- Baseline-setting commit: `8ea3c9ceea0bfcbc5748dd7b542bf91f9da4890d`
