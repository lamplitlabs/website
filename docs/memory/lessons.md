# Memory: Resolved blockers (do not re-investigate)

**Date:** 2026-10-09  
**Type:** Lesson  
**Scope:** tests/routes.test.mjs / ai.lamplitlabs.com gating  
**Resolution:** resolved (commit 2ecc780)  

## Summary

Failure pattern `MEM-failure-pattern-0474745e` ("blocked: kestrel-N whole-page ai.lamplitlabs.com assertion still deferred") is superseded: the whole-page assertion landed in commit `2ecc780` and `npm test` passes cleanly on HEAD (100 pass, 0 fail, including `tests/routes.test.mjs` around line 398).

## Context

Earlier jobs stopped as blocked because the whole-page `ai.lamplitlabs.com` export assertion was deferred. That work is now committed; any job briefed with this failure pattern should treat it as closed rather than re-investigating.

## Details

- Verify with `npm test` (check:test); the subtests "static export (out/) ... has zero ai.lamplitlabs.com ..." all pass.
- The Pulse record was set to `Superseded` on 2026-10-09 by iris.
- If a future brief still cites 0474745e as an open blocker, say so in FINDING and move on to real product work.

## Related Patterns

- tests/routes.test.mjs (static export guards while Light is in development)
