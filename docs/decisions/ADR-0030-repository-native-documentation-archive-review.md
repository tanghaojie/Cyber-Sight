---
title: ADR-0030 Repository-native documentation reconstruction and archive review
status: accepted
date: 2026-08-06
---

# ADR-0030 Repository-native documentation reconstruction and archive review

## Context

The repository is used by multiple AI agents. A platform-specific marker such as
`.codex/archive-pending.json` cannot reliably transfer a documentation maintenance task
between agents. Human commits also commonly change implementation without updating Design
documents or ADR context.

The repository therefore needs a shared trigger that every compliant agent can recognize,
without requiring a particular AI runtime or background daemon.

## Decision

Use a repository-native, startup-time audit protocol:

- `pnpm docs:archive:check` computes archive-review status from Git history, current documents,
  active plans, and the versioned archive ledger.
- `docs/archive/archive-policy.json` stores thresholds and immediate-trigger rules.
- `docs/archive/archive-ledger.json` stores the last completed review baseline per scope.
- A due review is represented by a normal implementation plan in `docs/plans/active/` with
  `type: documentation-archive-review`.
- Any AI agent may continue an existing archive-review plan; no AI-specific hidden marker is
  required.
- The review reconstructs current Design and ADR content from code, tests, contracts, database
  changes, and human-authored Git history before moving replaced documents into `docs/archive/`.

The audit is read-only. It does not create a task file or modify the working tree. The agent
that starts the review creates the active plan after applying the normal staged-area safety gate.

## Trigger policy

The default review thresholds are:

- 20 effective code commits within the same scope;
- 3 newly accepted ADRs;
- 3 completed feature plans;
- 30 days since the last review.

Architecture changes, broken current-document links, and superseded ADRs trigger an immediate
review. Formatting-only, documentation-only, merge, generated-output, and lockfile-only changes
do not count as effective code commits.

## Evidence and uncertainty

Current code, tests, contracts, migrations, and Git diffs may establish implementation facts.
Commit messages may provide design rationale. An agent must not invent intent that cannot be
supported by repository evidence; unresolved intent is recorded for maintainer confirmation.

## Consequences

All AI agents share the same trigger and task queue. The protocol works during ordinary task
startup and does not require a platform-specific daemon. The audit is intentionally separate from
the AI execution step, so Git hooks remain fast and deterministic.

The ledger and archive-review plan become additional repository governance artifacts. They must
be kept consistent with the current documentation indexes and the archive lifecycle.
