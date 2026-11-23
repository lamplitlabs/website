# ADR draft (not accepted): Where the /ai content comes from, and what ai.lamplitlabs.com becomes

**Date:** 2026-11-08  
**Status:** Draft for owner review - written as a plan document because agents may not edit `docs/decisions/`  
**Authors:** ripple-31 (TASK-084)  
**Affects:** `app/ai/page.tsx`, `lib/ai-models.ts`, `vercel.json`, the `lamplitlabs/ai` repository and its deploy

## Problem

TASK-084 says the AI project "should live in this repository and be served at
/ai". The first step ([feature](../features/ai-route.md)) serves a static page
built from a hand-copied snapshot of the AI project's `site.json`. Two
decisions remain that an agent cannot take:

1. **Data source.** The AI project's README says its numbers are written by
   the model producer into one generated file, refreshed after every training
   round. A hand snapshot here will go stale after the next round.
2. **The second site.** `ai.lamplitlabs.com` still serves the AI project's own
   Vite site (HTTP 200 on 2026-11-08) and is linked from this site only once
   Light is Live. Running both means two copies of the same content.

## Options Considered

### Option 1: Keep a dated snapshot in `lib/ai-models.ts` (what ships now)
**Pros:** no dependency, no cross-repo build coupling; the page shows the date it was measured.  
**Cons:** someone has to refresh it by hand after each training round.

### Option 2: The producer writes `site.json` (or a trimmed copy) into this repo
**Pros:** one source of truth; numbers stay current.  
**Cons:** the producer pipeline gains write access to this repo; changes the AI project's data contract (its ADR-001).

### Option 3: Port the whole AI site (models, benchmarks, in-browser try page) into this repo
**Pros:** one site, one deploy.  
**Cons:** needs React 19 client runtime code, Tailwind 4 and in-browser inference packages here (Tier 2 dependency decision); larger review.

### For ai.lamplitlabs.com
- (a) keep it as is; (b) redirect it to `https://www.lamplitlabs.com/ai`
  (DNS/Vercel change, owner only); (c) keep it for the in-browser playground
  only and send its landing page here.

## Decision

None yet - owner input needed on (1) the data source and (2) the second
site's future. Until then Option 1 stands, and while Light is In development
the `/ai` page links to Hugging Face, not to `ai.lamplitlabs.com`.

## Consequences

- With Option 1, the refresh steps in
  [`2026-11-08-serve-ai-at-slash-ai.md`](2026-11-08-serve-ai-at-slash-ai.md#refreshing-the-model-snapshot)
  are the process.
- Choosing (b) would also mean flipping `canonicalUrl` of the `light` product
  in `lib/site-data.ts` to `/ai` and revisiting the tests that gate
  `ai.lamplitlabs.com` links on Light's status.
