# Memory: Evolve fixture `behaviour-search-plural-words`

**Date:** 2026-11-22  
**Type:** Convention  
**Scope:** Product search (`lib/product-search.ts`), catalogue (`lib/site-data.ts`), self-improvement loop fixtures  
**Resolution:** open: the tree with `409c4de` scores 19 (3 of 16 plural chip words find their products)

## Summary

This fixture measures a twelfth search behaviour. People type what they want in the plural: "languages",
"trainings", "integrations", "architectures", "devices". The chips on the product cards are singular
("Language", "Training", "Integration"). A plural that the copy does not also hold finds nothing today.

## Context

- `matchesProductQuery` in `lib/product-search.ts` needs each folded query word as a substring of some field. A
  plural is longer than the singular, so "languages" cannot be a substring of "language".
- `suggestProductQuery` sometimes shows a "did you mean" hint, because a trailing `s` is one edit away. The grid
  still says "No products match", and "languages", "germanies", "developers" and "securities" get no hint at all.
- Once `409c4de` lands the edge-punctuation fix, all eleven other behaviour fixtures score 1.0. This is the only
  search gap the loop measures now.

## Details

- **Pool:** every single word of 4 or more letters in the product tags that does not already end in `s`. That is 16
  at `409c4de`.
- **Plural:** consonant + `y` becomes `ies`. A word ending in `ch`, `sh`, `x` or `z` takes `es`. Any other word
  takes `s`.
- **Hit:** `filterProductsByQuery(products, plural)` lists exactly the products the singular lists. The score is
  the percentage of hits (`--scale 100`).
- **Score 0 (guards):**
  - fewer than 10 pool words
  - `zzqxnosuch`, `zzqxnosuchs`, `zzqxnosuchies` or `azures zzqxnosuch` finds anything
  - `azure` or `azures` finds every product
  - `draw.io` or `assets` stops finding Azure Draw.io Assets
  - `tools` stops finding EDMX Tools
  - `utilities` stops finding Developer Tools
  - a singular pool word finds nothing
  - the source does not load
- **Loading:** the same as the other search fixtures. It imports `lib/site-data.ts` and `lib/product-search.ts`
  with Node type stripping (Node 22.18 or later, so `/usr/local/bin/node`). An empty tree prints 0.
- **Moving it honestly:** a scratch copy of `lib/product-search.ts` scores 100 and keeps every guard with one
  change. In `matchesProductQuery`, a word that does not match as typed is tried once more without its English
  plural ending: `ies` becomes `y`, `ches`/`shes`/`xes`/`zes` lose `es`, and a final `s` is dropped unless
  the word ends in `ss`.
  - Cover it in `tests/product-search.test.mjs`.
  - Do not edit catalogue copy or tags to raise the count.

## Related Patterns

- [`2026-11-19-evolve-fixture-search-edge-punctuation.md`](2026-11-19-evolve-fixture-search-edge-punctuation.md):
  the eleventh search fixture. `409c4de` lands it (0 → 100) from the stranded kept experiment B-030.
- [`2026-11-05-evolve-fixture-search-typo-tolerant.md`](2026-11-05-evolve-fixture-search-typo-tolerant.md): the
  hint that rescues some of these plurals today, under a "No products match" banner

## Impact

- This score moves with any change to `fold`, `queryWords` or `matchesProductQuery`, and with any tag added to or
  removed from `lib/site-data.ts`.
