# Memory: Evolve fixture `behaviour-search-typo-tolerant`

**Date:** 2026-11-05  
**Type:** Convention  
**Scope:** Product search (`lib/product-search.ts`), product grid (`components/product-grid.tsx`), catalogue (`lib/site-data.ts`), self-improvement loop fixtures  
**Resolution:** open: HEAD `7ab6752` scores 0/52  

## Summary

The self-improvement loop now scores a fifth search behaviour that visitors notice. A visitor who mistypes one word from a product's name or chips should still find the product. Examples: one letter missing ("complance", "deutshland") or two neighbouring letters swapped ("secruity", "devleoper").

## Context

The four earlier search fixtures are saturated:

- `behaviour-search-finds-features`: 37/37
- `behaviour-search-multiword-tags`: 54/54
- `behaviour-search-punctuation-free`: 27/27
- `behaviour-search-stray-word`: 108/108

Archive rows B-016 to B-020 are all neutral, which means the experiment lane has no product signal left to climb.

At `7ab6752`, `suggestProductQuery` returns `null` for any one-word query (`terms.length < 2`). So a single mistyped word still shows "No products match" and offers no way forward. The did-you-mean hint added in `b5e6408` covers only a stray extra word.

## Details

- **Query pool (scale 52):** for each product, take every word of 6 or more letters in its `name` or `tags`, folded and split on non-alphanumerics. Each word gives two typos at its middle letter: one drops that letter, the other swaps it with the letter before (only when the two letters differ). A typo stays in the pool only if it is not a substring of any product's searchable copy. 52 typos at `7ab6752`.
- **Hit:** the real `filterProductsByQuery(products, q)` returns the product without returning the whole catalogue. Or the real `suggestProductQuery(products, q)` returns an object whose `products` include it, again without the whole catalogue.
- **What scores 0:**
  - `suggestProductQuery` is missing;
  - `"zzqxnosuch"`, `"qwertyuiop"` or `"zzqx no such product 7"` finds anything or gets a suggestion;
  - `"Azure zzqxnosuch"` finds anything;
  - a query that already matches (`"azure"`, `"Compliance"`) gets a suggestion;
  - the source does not load.
- **Runtime:** the same as the other search fixtures. The scorer imports the `.ts` modules through Node type stripping (Node 22.18 or later, falling back to `/usr/local/bin/node`). It needs no `node_modules` and no build.
- **How to move it honestly:** let `suggestProductQuery` handle a one-word query of 5 or more letters that matches nothing. Find the catalogue word within edit distance 1, where an adjacent swap counts as one edit, and return `{ query: <that word>, dropped: <typed word>, products }`. Existing "Showing results for …" hint in the grid then renders it. A scratch copy with exactly that change scores 52/52 and keeps the guards at 0. Cover it in `tests/product-search.test.mjs`. Do not edit catalogue copy to raise the count. If the grid text "Showing results for" reads oddly for a corrected spelling, change it in `components/product-grid.tsx`, and leave a screenshot.
- Copy edits to names or tags change the pool. Treat 52 as the count at `7ab6752`.

## Related Patterns

- [`2026-11-04-evolve-fixture-search-punctuation-free.md`](2026-11-04-evolve-fixture-search-punctuation-free.md): the third search fixture
- [`2026-11-03-evolve-fixture-search-multiword-tags.md`](2026-11-03-evolve-fixture-search-multiword-tags.md): the second search fixture and the stray-word note
- `tests/product-search.test.mjs`: the existing search behaviour tests

## Impact

- This score moves with any change to `suggestProductQuery` or `filterProductsByQuery`, and with any change to product names or tags in `lib/site-data.ts`.
