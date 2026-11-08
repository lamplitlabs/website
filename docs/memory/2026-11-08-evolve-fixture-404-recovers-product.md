# Memory: Evolve fixture `behaviour-404-recovers-product`

**Date:** 2026-11-08  
**Type:** Convention  
**Scope:** 404 page (`app/not-found.tsx`), catalogue (`lib/site-data.ts`), self-improvement loop fixtures  
**Resolution:** open: HEAD `af2e848` scores 17/59 (29)  

## Summary

The self-improvement loop now scores a behaviour that is not search. A visitor who follows a broken link or types a product URL by hand lands on the 404 page. That page should offer the product they meant ("Did you mean ...?") instead of a dead end.

## Context

The seven search fixtures (`behaviour-search-*`) gave the loop its selection pressure from 2026-11-01 to 2026-11-07. Six of them score 1.0, and the seventh (`behaviour-search-card-labels`) has a passing branch waiting to land. Every kept experiment in the archive since B-013 touched `lib/product-search.ts`. The 404 near-miss suggestion in `app/not-found.tsx` is the site's other way to recover a lost visitor, and no check measured it.

At `af2e848`, `findNearMissProduct` reads only `/products/<slug>`. It lower-cases the slug, then accepts an edit distance of at most a third of the slug's length, and only when the attempt shares the real slug's first **and** last letter. As a result:

- A capitalised slug (`/products/Eszett`) is lower-cased and then rejected, because an exact match is treated as "would not 404". On a static host the capitalised path does 404, so the visitor gets nothing.
- The slug at the site root (`/eszett`) or under the singular segment (`/product/eszett`) is never tried: `findNearMissStaticRoute` checks only the privacy page and the nav anchors.
- A trailing "s" (`/products/eszetts`) or a dropped last letter (`/products/kenntnistraine`) changes the last letter, so the boundary guard rejects it. The exception is a slug that already ends in "s", such as `developer-tools`.

Per product at `af2e848`: the swapped-letters slip is recovered for 8 of 9 products (not `light`), the joined form for all 5 hyphenated slugs, the trailing "s" for 3, the dropped last letter for 1 (`eszett`), and the capitalised, root and singular forms for none.

## Details

- **Pool (59 URLs):** for each product in `products`, try these slips:
  - `/products/<slug>s`
  - `/products/<slug minus last letter>`
  - `/products/<Slug>` (capital first letter)
  - `/products/<slug with its two middle letters swapped>`
  - `/<slug>`
  - `/product/<slug>`
  - `/products/<slug without hyphens>`, for hyphenated slugs only

  That gives 9 × 6 + 5 = 59 URLs at `af2e848`.
- **Hit:** `findNearMiss(path).href === "/products/<slug>"`. The score is the percentage of hits, `--scale 100`.
- **Where `findNearMiss` comes from:** the first `lib/*.ts` that exports a function or const named `findNearMiss`. If no file does, the scorer uses the code in `app/not-found.tsx` above `export default function NotFound`. It removes `"use client"` and the non-`@/lib/` imports, rewrites `@/lib/x` to `lib/x.ts`, strips the types with `module.stripTypeScriptTypes` and imports the result. Moving the helper into `lib/` and exporting it keeps the score.
- **What scores 0:**
  - any of these gets a suggestion: `/products/zzqxnosuch`, `/zzqxnosuch`, `/products/night`, `/products/flight`, `/api`, `/products/zzqxnosuch/extra`
  - `findNearMiss` is missing
  - the source does not load
- **Runtime:** the scorer needs Node 22.18 or later, for type stripping and `module.stripTypeScriptTypes`. Like the search fixtures, it falls back to `/usr/local/bin/node` when the pinned Node 20 cannot. It needs no `node_modules` and no build, and an empty tree prints 0.
- **How to move it honestly:** a scratch copy of `app/not-found.tsx` scored 75. In that copy, `findNearMissProduct` also matches `/product/<x>` and `/<x>`. It treats a case-only difference (`raw !== slug`) and a hyphen-only difference as near misses, and otherwise keeps `nearMissDistance`. Further room is in the trailing-"s" and dropped-letter slips, which the last-letter guard blocks.
  - Keep the guards. `/products/night` must not suggest Lamplit Light. That is why the guard exists.
  - Cover the change in a test. Do not rename slugs to raise the count.
- Adding, removing or renaming a product changes the pool. Treat 59 as the count at `af2e848`.

## Related Patterns

- [`2026-11-07-evolve-fixture-search-card-labels.md`](2026-11-07-evolve-fixture-search-card-labels.md): the seventh search fixture, written the same way
- [`2026-11-01-evolve-fixture-search-finds-features.md`](2026-11-01-evolve-fixture-search-finds-features.md): the first behaviour fixture, which explains the Node type-stripping fallback

## Impact

- This score moves with any change to `findNearMiss`, `findNearMissProduct`, `findNearMissStaticRoute` or `nearMissDistance` in `app/not-found.tsx`, and with any change to product slugs in `lib/site-data.ts`.
