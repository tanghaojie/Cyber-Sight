---
title: Repository-native documentation archive review follow-up
type: documentation-archive-review
status: active
scope: repository
created: 2026-08-06
updated: 2026-08-06
baseline_commit: dbd6d4ad520de99b58f1d7fbb2b8d10320e12f53
---

# Repository-native documentation archive review follow-up

## Goal

Review the repository documentation against the current implementation after the archive
audit became due, then archive only documents, plans, logs, designs, or ADRs that are proven
to be superseded. Preserve current human-authored behavior and record unresolved intent for
maintainer confirmation.

## Background and design basis

The archive audit uses `dbd6d4ad520de99b58f1d7fbb2b8d10320e12f53` as the repository baseline,
with review time `2026-07-29T18:15:02+08:00`. The current audit reports `DUE` because the
baseline window contains 48 effective commits, 6 accepted ADRs, 34 completed features, and
an architecture change.

The workflow follows `docs/design/documentation-governance.md` and
`docs/decisions/ADR-0030-repository-native-documentation-archive-review.md`. The audit is a
read-only trigger; this plan is the shared task marker for the review.

## Scope

- Reconstruct current behavior from implementation, tests, API contracts, database schema or
  migrations, and Git history since the baseline.
- Reconcile current Design documents and ADRs with the verified implementation.
- Identify historical plans and AI logs that are complete and eligible for archival.
- Update current indexes and relative links when archival is justified.
- Update the archive ledger only after the review is complete and verified.

## Out of scope

- Rewriting or reverting human-authored implementation or documentation without evidence.
- Archiving documents solely because they are old or because a threshold was reached.
- Inventing design intent from commit messages when repository evidence is insufficient.
- Deleting historical evidence.

## Preconditions and risks

- Keep the staged-area safety gate clear before each write phase.
- Treat current human-authored code, configuration, tests, contracts, and active documents as
  authoritative when they conflict with historical material.
- Record maintainer-confirmation items instead of guessing when intent is ambiguous.
- Preserve recoverable Git history and verify all links after moves.

## Implementation tasks

- [ ] Inventory commits, changed modules, tests, contracts, migrations, current Design, and
      current ADRs from the baseline to HEAD.
- [ ] Classify each historical Design, ADR, completed plan, and AI log as current, mergeable,
      superseded, or unresolved using repository evidence.
- [ ] Update current Design or ADR documents where the implementation establishes a clear
      current fact or long-term decision.
- [ ] Move only proven superseded or completed artifacts into the matching `docs/archive/`
      subtree and update indexes and links.
- [ ] Record unresolved decisions and required maintainer confirmation in this plan and the
      AI log.
- [ ] Run formatting, link, and archive-audit verification; update the ledger after completion.
- [ ] Move this completed plan and its AI log to the archive locations and mark them completed.

## Verification

- `pnpm format`
- `pnpm format:check`
- `pnpm docs:archive:check`
- Repository-specific link and index checks required by the final diff
- `git diff --check`

## Publication and rollback

Keep archival moves reviewable in Git and do not remove evidence. If verification exposes a
broken link, incorrect current-document authority, or unresolved ownership conflict, stop the
move phase, preserve the evidence, and record the blocker for maintainer review.

## Actual deviations and open questions

The plan was created after the initial `DUE` result because the previous task updated the
baseline but did not create the required active archive-review plan. No archive moves have
been performed yet.

## Related design, ADR, and AI log

- `docs/design/documentation-governance.md`
- `docs/decisions/ADR-0030-repository-native-documentation-archive-review.md`
- `docs/ai-logs/2026/08/2026-08-06-repository-native-archive-review-follow-up.md`
