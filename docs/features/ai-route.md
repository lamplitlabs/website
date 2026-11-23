# Feature: /ai - the AI project's content on lamplitlabs.com

**ID:** FEAT-004  
**Date:** 2026-11-08  
**Status:** In Development (branch `pulse/ripple-31/job-20261108T021233Z-90104b`, TASK-084)  
**Owner:** Lamplit Labs  
**Tier:** 1 - a new static page, a nav target change and tests; no dependency, deploy-config or data change beyond one Vercel redirect removed

## Overview

The AI project (`lamplitlabs/ai`, the source of `ai.lamplitlabs.com`) is a
separate Vite/React 19/Tailwind 4 site that lists Lamplit Light's models with
the numbers they were measured on. TASK-084 asks for that content to live in
this repository and be served at `/ai`. Before this change `/ai` was a 404 on
the static export (and on Vercel a redirect to the homepage `#ai` section), so
a visitor who wanted to see the models had to leave the site for a domain whose
product is still marked **In development**.

`/ai` is now a statically exported page in this site's own design: Lamplit
Light's pitch, what "sovereign" means for the buyer, where the models run, one
card per model offering (purpose, parameters, facts score against its gate,
where it runs, size, licence, every release gate with measured vs. needed
share and the date it was measured, links to try it and to its weights on
Hugging Face), and a call to ask for a model for your own job.

## User Story

**As a** visitor to lamplitlabs.com interested in Lamplit Light  
**I want to** open one page that shows which models exist today and how well they were measured to work  
**So that** I can try one or download its weights without hunting for a second site

## Requirements

### Functional Requirements
- `app/ai/page.tsx` renders at `/ai` in the static export (`out/ai.html`), canonical `https://www.lamplitlabs.com/ai`.
- Model data lives in `lib/ai-models.ts`: a typed, dated snapshot of the AI project's `js/ui/src/data/site.json` (repo, commit and generation date recorded in `aiDataSource`). Only buyer-facing fields are copied: label, line, edition, pitch, parameters, where it runs, size, licence, Hugging Face repo/Space, measured date, and release-gate actual/threshold pairs.
- The `AI` entry in `navLinks` points at `/ai`. Off-home consumers resolve nav hrefs through `navLinkHref()` (a bare `#anchor` becomes `/#anchor`; routes and external URLs are unchanged). Header, footer, privacy, error and 404 navs all link to `/ai`; the `/ai` nav marks AI with `aria-current="page"`.
- `app/sitemap.ts` lists `/ai`.
- `vercel.json` no longer redirects `/ai` to `/#ai` (that redirect would shadow the new page on Vercel).
- The 404 page suggests `/ai` for near misses such as `/ai-models`.
- While Light is **In development** the page links to no `ai.lamplitlabs.com` URL; its outbound links go to Hugging Face (model repos, the browser Space, the org page). Status copy reads "In development · public site coming to <domain>", the domain derived from `lib/site-data.ts`.
- Copy describes outcomes, not training method ([memory](../memory/2026-09-11-public-copy-describes-outcomes-not-method.md)); `tests/smoke.test.mjs` scans `app/ai/page.tsx` and `lib/ai-models.ts` for method words.

### Non-Functional Requirements
- Performance: server component, no client JavaScript of its own beyond `OutboundLink` tracking; first-load JS ~121 kB like the other static pages.
- Accessibility: one `h1`, labelled sections, per-model `article` labelled by its heading, gate table with caption and row/column headers inside a native `<details>`.
- Browser support: same as the rest of the site.
- Localization: English only (open question 6 unanswered).

## Acceptance Criteria

- [x] `out/ai.html` exists after `npm run build` and renders one card per model in `lib/ai-models.ts`, each with a gate summary and a Hugging Face weights link (`tests/routes.test.mjs`).
- [x] `out/sitemap.xml` lists `/ai` (sitemap test with `/ai` in `staticRoutes`).
- [x] Home, privacy and 404 pages link to `/ai` and never to `/#ai` from the nav.
- [x] `vercel.json` keeps the `/products`, `/about`, `/contact` redirects and has none for `/ai`.
- [x] `npm run check` passes.

## Implementation Notes

- The AI project's own pages (`/models`, `/benchmarks`, `/try`, with the judge
  panel, export-fidelity tables and the in-browser runtime) are **not** ported:
  they need React 19 client code, Tailwind 4 and runtime packages this
  repository does not have (a dependency decision, Tier 2). `/ai` carries the
  landing-page content and the offerings with their gate numbers; the "Try it"
  CTA opens the existing Hugging Face Space.
- Judge-panel verdicts are not shown: no model is "satisfied" by the panel yet
  (0 of 5 judges for both), and how to present that is a product call for the
  AI project, not this page.
- The snapshot is refreshed by hand from `site.json` after each training
  round; see the plan. Whether this site should instead read the AI project's
  data automatically, and whether `ai.lamplitlabs.com` should redirect here,
  are open decisions written up in the [ADR draft](../plans/2026-11-08-adr-draft-ai-content-source.md).

## Rollback

See [`docs/plans/2026-11-08-serve-ai-at-slash-ai.md`](../plans/2026-11-08-serve-ai-at-slash-ai.md#rollback-plan-required).
