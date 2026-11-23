# Memory: Evolve fixture `behaviour-search-edge-punctuation`

**Date:** 2026-11-19  
**Type:** Convention  
**Scope:** Product search (`lib/product-search.ts`), catalogue (`lib/site-data.ts`), self-improvement loop fixtures  
**Resolution:** resolved: 0 at `56f3e39` (0/232 wrapped queries), 100 once the kept experiment B-030 (`d9620ab`,
stranded on `evolve/20261119T150724Z-lamplitlabs-lead-rsi-2`) landed on `main` in RSI sitting 31

## Summary

This fixture measures an eleventh search behaviour. People type into a search box the way they write: in quotes
(`"Eszett"`, `“Azure”`, `'OData'`), in brackets (`(AI)`), or with punctuation still on the end (`azure?`,
`edmx tools.`, `kenntnistrainer,`). Today each of those finds nothing, even though the bare word finds the product.

## Context

- `queryWords` in `lib/product-search.ts` folds the query and splits it on spaces and hyphens. A mark at the start
  or end of a word stays on it, so `azure?` has to appear in the copy as `azure?` to match.
- `suggestProductQuery` shows a "showing results for" hint for some of these (`azure?` → `azure`). It shows no
  hint for quoted words or bracketed words (`"kenntnistrainer"`, `(ai)`, `'azure'`).
- All ten other behaviour fixtures score 1.0 at `56f3e39`, so this is the only search gap the loop measures now.

## Details

- **Pool:** every product name and tag in `lib/site-data.ts` that starts and ends with a letter or digit. That is
  29 at `1b5c9c6`. `.NET` is left out because it starts with a dot.
- **Wraps (8 per word):** `"w"`, `“w”`, `'w'`, `(w)`, `w?`, `w.`, `w,` and `w!`.
- **Hit:** `filterProductsByQuery(products, wrapped)` lists exactly the products the bare word lists. The score is
  the percentage of the 232 wrapped queries that hit (`--scale 100`).
- **Score 0 (guards):**
  - fewer than 10 pool words
  - `zzqxnosuch`, `azure zzqxnosuch`, `(zzqxnosuch)` or `zzqxnosuch?` finds anything
  - `azure` finds every product
  - `draw.io` or `drawio` stops finding Azure Draw.io Assets
  - `.net` stops finding EDMX Tools
  - a bare pool word stops finding its product
  - the source does not load
- **Loading:** the same as the other search fixtures. It imports `lib/site-data.ts` and `lib/product-search.ts`
  with Node type stripping (Node 22.18 or later, so `/usr/local/bin/node`). An empty tree prints 0.
- **Moving it honestly:** in a scratch copy of `lib/product-search.ts`, one change scores 100 and keeps every
  guard. The change: in `queryWords`, strip `^[^\p{L}\p{N}]+` and `[^\p{L}\p{N}]+$` from each split word and drop
  any word left empty. Inner marks stay, so `draw.io` still matches as typed.
  - Cover it in `tests/product-search.test.mjs`.
  - Do not edit catalogue copy to raise the count.
  - A query that is only punctuation (`?`, `""`) then counts as blank and lists every product. That is what an
    empty box shows too.

## Related Patterns

- [`2026-11-04-evolve-fixture-search-punctuation-free.md`](2026-11-04-evolve-fixture-search-punctuation-free.md): the
  opposite case, a visitor who leaves the copy's own punctuation out (`drawio`)
- [`2026-11-10-evolve-fixture-search-umlaut-spelled.md`](2026-11-10-evolve-fixture-search-umlaut-spelled.md): the
  tenth search fixture. Commit `56f3e39` lands it (0 → 100) from the saved patch of the stranded experiment
  `evolve/20261110T102416Z-lamplitlabs-lead-rsi-4`.

## Landing note

The lane kept B-030 (0.6923 → 0.7309) but never landed it: it retried for 72 rounds with "already delivered at
`d9620ab`", then gave up and left the branch for review. Sitting 31 applied `git diff 86f39fa d9620ab` with
`git apply --3way` onto `main`, and `npm run check` passed (155/155). Check `git merge-base --is-ancestor <sha> HEAD`
for every kept archive row: a kept row is not the same as a landed row.

## Impact

- This score moves with any change to `fold`, `queryWords` or `matchesProductQuery`, and with any product name or
  tag added to or removed from `lib/site-data.ts`.
