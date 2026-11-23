# Feature: 404 page recovers product URLs with a slip in them

**ID:** FEAT-005  
**Date:** 2026-11-08  
**Status:** Shipped  
**Owner:** granite-36 (PULSE job job-20261108T171510Z-b6aa41)

## Overview

A visitor who follows a broken link, or types a product URL by hand, lands on the 404 page. Before this change the page's "Did you mean ...?" link read only `/products/<slug>` and fired only for small typos. The most common slips got a bare dead end: a capital letter (`/products/Eszett`, which 404s on Vercel's case-sensitive static host), the slug at the site root (`/eszett`), the singular segment (`/product/eszett`), and a hyphen left out (`/products/edmxtools`). The 404 page now offers the real product for each of these.

## User Story

**As a** visitor with a product URL that is slightly wrong  
**I want to** be offered the product I meant on the 404 page  
**So that** I reach it in one click instead of going back to the home page and searching

## Requirements

### Functional Requirements
- `findNearMissProduct` in `app/not-found.tsx` reads `/products/<x>`, `/product/<x>` and `/<x>`, with an optional trailing slash and the segment name in any case.
- A case-only difference from a real slug, or the real slug under `/product/` or at the root, is a near miss (distance 0).
- A hyphen-only difference (hyphens added, dropped or moved) is a near miss (distance 1).
- Every other attempt still goes through `nearMissDistance`: an edit distance of at most a third of the slug's length, and the same first and last letter.
- The real product page (`/products/<slug>` in exact case) never shows a suggestion.
- Product suggestions keep priority over static-route suggestions (`findNearMissProduct(pathname) ?? findNearMissStaticRoute(pathname)`).

### Non-Functional Requirements
- Performance: one pass over the nine products per 404 view; no new dependency.
- Accessibility: unchanged; the suggestion is the existing `data-testid="not-found-suggestion"` paragraph and link.

## Acceptance Criteria

- [x] `/products/Eszett`, `/eszett` and `/product/<slug>` suggest `/products/<slug>` for every product.
- [x] `/products/<slug without hyphens>` suggests the hyphenated product.
- [x] `/products/night`, `/products/flight`, `/api`, `/products/zzqxnosuch`, `/zzqxnosuch` and `/products/zzqxnosuch/extra` get no suggestion.
- [x] `/privcy` and `/ai-models` still suggest `/privacy` and `/ai`.

## Implementation Notes

- `tests/not-found-near-miss.test.mjs` imports the page's own helpers (everything above `export default function NotFound`) with the real catalogue, so the test cannot drift from the page the way a mirror copy can.
- Trailing-"s" and dropped-last-letter slips (`/products/eszetts`) are still blocked by the last-letter guard. Loosening that guard is a separate change that must keep `/products/night` silent.
- The scorer for the evolve fixture `behaviour-404-recovers-product` reads the same code; see `docs/memory/2026-11-08-evolve-fixture-404-recovers-product.md`.

## Related Decisions

- None needed: a client-side change to an existing page, with no new route, data or dependency.

## Rollback Plan

Revert the commit. It touches only `app/not-found.tsx`, the new test file and this document.

## Success Metrics

- Evolve fixture `behaviour-404-recovers-product`: 17/59 (29) at `af2e848`. With this change, a local copy of the scorer's pool and guards gives 44/59 (75) as of 2026-11-08, still with no suggestion for any guard URL. The 15 misses left are the trailing-"s" and dropped-letter slips, plus the swapped-letter slip of `light`.
