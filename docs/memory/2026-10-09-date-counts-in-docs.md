# Memory: Date every count quoted in docs

**Date:** 2026-10-09  
**Type:** Convention  
**Scope:** docs/features, docs/plans, docs/memory  
**Resolution:** open (standing convention; template updated in `docs/features/_template.md`)  

## Summary

Whenever a doc quotes a number that the codebase changes over time (test pass count, page count, assertion total, product count), write it as "N as of YYYY-MM-DD" instead of a bare number.

## Context

`docs/features/lamplit-light-ai-section.md` recorded "`npm test` passed 89/89". The suite later grew to 96 tests, so the claim read as wrong to a reader checking docs against code (research job `job-20261009T064946Z-013f8b`); commit `8d70834` had to annotate it as historical. A dated count never goes wrong: it stays true about the day it was measured and tells the reader to re-measure rather than trust it.

## Details

- Write `96/96 as of 2026-10-09`, not `96/96` or `now reports 96/96`.
- Prefer naming the command that produced the number (`npm test`, `npm run build` page count) so the reader can rerun it.
- When updating a stale count, keep the original dated figure and add the new dated one; do not silently rewrite history.
- Counts that are fixed by design (e.g. "three internal nav targets, 0/3 -> 3/3") describe the change itself and do not need a date.

## Examples

```text
Good ✓  `npm test` passed 96/96 as of 2026-10-09.
Avoid ✗  `npm test` passes 96/96.
```

## Related Patterns

- [Feature: Lamplit Light AI Section](../features/lamplit-light-ai-section.md) (the drifted 89/89 claim)
- [Feature template](../features/_template.md) (Implementation Notes checklist item)

## Impact

- Anyone writing delivery evidence or verification notes in `docs/` should date counts.
- Doc-vs-code research jobs can skip dated counts as non-defects when the date is older than the suite change.
