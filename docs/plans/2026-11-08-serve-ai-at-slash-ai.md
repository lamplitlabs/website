# Work Plan: Serve the AI project's content at /ai (TASK-084)

**Date:** 2026-11-08
**Goal:** `/ai` on lamplitlabs.com shows Lamplit Light and its model offerings, linked from the nav and the sitemap
**Owner:** ripple-31 (PULSE job job-20261108T021233Z-90104b)
**Estimated Duration:** one job

## Objective

Bring the AI project's buyer-facing content (`lamplitlabs/ai`, local checkout
inspected read-only at commit `e14e339`) into this repository as a static
`/ai` page, without adding dependencies or changing deploy configuration
beyond removing the `/ai` -> `/#ai` redirect that would shadow the page.
Spec: [`docs/features/ai-route.md`](../features/ai-route.md).

## Success Criteria

- [x] `out/ai.html` is exported and lists every model in `lib/ai-models.ts`
- [x] Nav (header, footer, privacy, error, 404) links to `/ai`
- [x] `out/sitemap.xml` lists `/ai`
- [x] `npm run check` passes
- [x] Before/after screenshots in the job's artifacts report

## Tasks

### Phase 1: Content

- [x] 1.1 - Read `README.md`, `js/ui/src/pages/Landing.tsx`, `Offerings.tsx`, `data.ts` and `js/ui/src/data/site.json` in the AI checkout (read-only)
- [x] 1.2 - Snapshot buyer-facing model fields into `lib/ai-models.ts` with source repo/commit/date
- [x] 1.3 - `app/ai/page.tsx`: hero, sovereignty, runtimes, model cards with gate tables, contact CTA

### Phase 2: Wiring

- [x] 2.1 - `navLinks` AI -> `/ai`; `navLinkHref()` for off-home navs
- [x] 2.2 - `app/sitemap.ts` lists `/ai`; `vercel.json` drops the `/ai` redirect
- [x] 2.3 - 404 near-miss candidates include `/ai`

### Phase 3: Tests and docs

- [x] 3.1 - `tests/routes.test.mjs`: `/ai` export smoke test; nav, footer, sitemap, 404 and vercel tests updated for `/ai` as a route
- [x] 3.2 - `tests/smoke.test.mjs`: method-word guard covers the new files
- [x] 3.3 - Feature spec, architecture overview, addendum on the AI section spec, ADR draft for the open decisions

## Refreshing the model snapshot

After a training round changes `js/ui/src/data/site.json` in `lamplitlabs/ai`:

1. For each `models[]` entry with `showcase: true`, update or add its entry in
   `lib/ai-models.ts`: `label`, `line`, `edition`, `pitch`, `params_b`,
   `licence`, `hub.repo`/`hub.space`, `measured_at` (date part),
   `gate.release`, and every `gate.gates.<key>` as `[actual, threshold]`.
   `size` comes from `dtypes[].size_mb` (browser) or `weights_mb`/`memory_gb`
   (PyTorch editions).
2. Update `aiDataSource.commit` and `generatedAt`.
3. Do not copy `purpose`, `system_prompt` or `base_model` text that describes
   the training method; `npm test` fails on method words.
4. `npm run check`.

## Verification Steps

1. `npm run check` (lint, typecheck, build, all node tests incl. the `out/` export tests)
2. Serve `out/` and open `/ai` at 1440x900 and 390x844, light and dark; read the console
3. Check that `/`, `/privacy` and a 404 page link the nav's AI item to `/ai`

## Rollback Plan (REQUIRED)

**Baseline:** `main` at `07eba0d`. Files touched: `app/ai/page.tsx` (new),
`lib/ai-models.ts` (new), `lib/site-data.ts` (`navLinks`, `navLinkHref`),
`app/privacy/page.tsx`, `app/error.tsx`, `app/not-found.tsx`,
`app/sitemap.ts`, `vercel.json`, `tests/routes.test.mjs`,
`tests/smoke.test.mjs`, docs.

**Trigger:** `/ai` returns 404 or a broken page on the Vercel deployment, the
nav's AI link dead-ends, or `npm run check` fails on `main` after merge.

**Reversal Steps:**
1. `git revert <merge commit>` - restores `{ label: "AI", href: "#ai" }`, the
   `/ai` -> `/#ai` redirect in `vercel.json`, and removes `app/ai/`.
2. Verify baseline restored: `npm run check`, then `test ! -f out/ai.html` and
   `grep -c '"/ai"' vercel.json` (1).

**Recovery Checks:** the homepage `#ai` section is untouched by this change, so
after a revert the nav's AI item scrolls to it as before.
