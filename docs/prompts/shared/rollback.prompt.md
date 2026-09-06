---
id: S-ROLLBACK
title: Execute Safe Rollback for Failed Changes
status: Active
date: 2026-08-11
target: shared
tags: [prompt, rollback, recovery, safety]
---

# Execute Safe Rollback for Failed Changes

Use this prompt when a change has failed verification and cannot be safely fixed without reverting.

## When to Use This Prompt

- A change fails `npm run lint`, `npm run typecheck`, or `npm run build`
- The failure matches the rollback trigger defined in the active work plan
- You cannot fix the root cause without expanding scope
- A prepared rollback plan exists in `docs/plans/` or session notes

## Execution Steps

1. **Diagnose** the exact failure. Does it match the prepared rollback trigger?
   - Run the failed verification command
   - Confirm the error type matches the plan

2. **Review the rollback plan** from your active work file:
   - Confirm Baseline, Trigger, Reversal, and Recovery Checks
   - Ensure reversal uses only safe commands (no `git reset --hard` or force-push)

3. **Execute reversal:**
   - Use `git checkout <file>` to restore specific files
   - Use `git reset HEAD <file>` to unstage changes
   - Verify `git status --short` shows only intended reversions

4. **Verify recovery:**
   - Run all recovery checks from the plan
   - Confirm all checks pass
   - Confirm no files are modified beyond plan scope

5. **Record the outcome:**
   - Document in the work plan when rollback was executed
   - Note the date, trigger, files restored, and verification results
   - Report to the user or close the work item

## Safety Rules

- **Do not use destructive commands:** Avoid `git reset --hard`, `git clean`, history rewriting, or force-push
- **Preserve user work:** Only revert files modified by the current task
- **Stop if uncertain:** If rollback scope is unclear or might touch unrelated work, stop immediately and report
- **Verify recovery:** Run all checks before confirming rollback success

## Example: Failed TypeScript Change

**Failure:**
```bash
npm run typecheck
# error: Type 'string' is not assignable to type 'number'
```

**Rollback:**
```bash
git status --short
# M  components/NewFeature.tsx
# M  app/page.tsx

git checkout components/NewFeature.tsx app/page.tsx
```

**Verify:**
```bash
npm run typecheck     # ✓ passes
npm run build         # ✓ succeeds
```

**Outcome:** Features reverted; repository at baseline.

## When Rollback Itself Fails

**STOP immediately.** Do not attempt additional recovery steps. Report:
- The exact current state (`git status --short`, `git diff --name-only`)
- The failed rollback command and error
- Pre-existing user work that might be affected
- Request manual intervention or team decision

## Related Resources

- **Rollback Workflow:** [`docs/workflows/rollback.md`](../../docs/workflows/rollback.md)
- **Work Plan Template:** [`docs/plans/_template.md`](../../docs/plans/_template.md)
- **PULSE Agent Guide:** [`AGENTS.md`](../../AGENTS.md) — see Rollback Planning & Agent-Driven Recovery
