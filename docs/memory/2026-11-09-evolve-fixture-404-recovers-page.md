# Memory: Evolve fixture `behaviour-404-recovers-page`

**Date:** 2026-11-09  
**Type:** Convention  
**Scope:** 404 page (`app/not-found.tsx`), navigation (`lib/site-data.ts` `navLinks`), self-improvement loop fixtures  
**Resolution:** open: HEAD `a8044ae` scores 3/14 (21)  

## Summary

This fixture is the 404 page's second behaviour fixture. `behaviour-404-recovers-product` scores product slips. This one scores the site's own pages. A visitor who types `/About`, `/AI`, `/Contact` or `/PRIVACY` by hand lands on a dead end today, while a longer typo such as `/contcat` or `/privcay` gets "Did you mean ...?".

## Context

- The static host is case-sensitive.
- The `vercel.json` redirects (`/products`, `/about`, `/contact`) match lower case only.
- `findNearMissStaticRoute` lower-cases the attempt and then skips it when it equals the route slug, as though the page "would not 404". So a capitalised page name gets no suggestion. A swapped-letter slip of a short page name (`/aobut`) gets none either, because it is 2 edits away.
- Commit `07e8747` fixed the same slip for products (`/products/Eszett`) but not for pages.

## Details

- **Routes:**
  - `/privacy`
  - every non-external `navLinks` entry: `#anchor` maps to `/#anchor`, `/ai` maps to itself

  At `a8044ae` that is 5 routes: privacy, products, ai, about and contact.
- **Pool:** for each route slug, try:
  - a capital first letter (`/About`)
  - all capitals (`/ABOUT`)
  - for slugs of 4 letters or more, the two middle letters swapped (`/aobut`)

  That gives 14 URLs at `a8044ae`.
- **Hit:** `findNearMiss(url).href` equals the route's href. The score is the percentage of hits, `--scale 100`.
- **Score 0 (guards):**
  - any suggestion for `/privacy`, `/ai`, `/api`, `/API`, `/ab`, `/zzqxnosuch`, `/Zzqxnosuch`, `/night` or `/products/zzqxnosuch`
  - fewer than 3 routes
  - no `findNearMiss`
  - source that does not load
- **Loading:** the same as `behaviour-404-recovers-product`. The fixture reads `findNearMiss` from a `lib/*.ts` that exports it, or else from `app/not-found.tsx` above the page component, with types stripped by Node 22.18 or later. An empty tree prints 0.
- **Moving it honestly:** treat a case-only difference from a route slug as a near miss. Compare the raw segment with the slug, not the lower-cased one, keep the guards and add a test. A scratch copy that changes only that scores 93. The one remaining miss is the swapped-letter `/aobut`: Levenshtein counts a swap as 2 edits, over the threshold of 1 for a 5-letter slug. Recovering it needs a transposition-aware distance that still keeps `/api` and `/night` silent.
  - Do not rename routes or nav labels to raise the count.
  - Adding a nav link changes the pool. Treat 14 as the count at `a8044ae`.

## Related Patterns

- [`2026-11-08-evolve-fixture-404-recovers-product.md`](2026-11-08-evolve-fixture-404-recovers-product.md): the product-slug fixture this one mirrors
