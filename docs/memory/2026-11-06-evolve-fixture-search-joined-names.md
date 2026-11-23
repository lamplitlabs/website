# Memory: Evolve fixture `behaviour-search-joined-names`

**Date:** 2026-11-06  
**Type:** Convention  
**Scope:** Product search (`lib/product-search.ts`), catalogue (`lib/site-data.ts`), self-improvement loop fixtures  
**Resolution:** open: HEAD `9cd9042` scores 1/13  

## Summary

The self-improvement loop now scores a sixth search behaviour that visitors notice. A visitor who types a product's name the way it appears in a URL or a hashtag should still find the product. That means the name written joined ("lamplitlight", "edmxtools", "azurecompliancematrix"), hyphenated ("leben-in-deutschland", "azure-compliance-matrix"), or as the product's own slug (`/products/azure-drawio-assets`).

## Context

The five earlier search fixtures are saturated at `9cd9042`, and each scores 1.0:

- `behaviour-search-finds-features`
- `behaviour-search-multiword-tags`
- `behaviour-search-punctuation-free`
- `behaviour-search-stray-word`
- `behaviour-search-typo-tolerant`

Archive rows B-022 and B-023 are both neutral. Both landed real search changes (`298f888`, `2f670ed`), but no fixture had headroom to show them.

At `9cd9042`, `matchesProductQuery` splits a query only on whitespace, and `searchableText` removes joining punctuation but keeps spaces. So "edmx-tools" and "edmxtools" both match nothing ("EDMX Tools" folds to "edmx tools"), and `suggestProductQuery` offers nothing either. The one hit of the 13 is the slug `light` (Lamplit Light): the word "light" appears in that product's copy, so it is found as an ordinary one-word query. Raw 1.

## Details

- **Query pool (scale 13):** take each product whose `name` has two or more words after folding (lower-case, NFD, letters, digits and spaces only). Each such product gives the set {`slug`, words joined, words joined with `-`}, de-duplicated. That is 13 queries over 5 products at `9cd9042`.
- **Hit:** the real `filterProductsByQuery(products, q)` returns the product without returning the whole catalogue. When it returns nothing, a hit also counts if the real `suggestProductQuery(products, q)` returns an object whose `products` include it, again without the whole catalogue.
- **What scores 0:**
  - `"zzqxnosuch"`, `"zzqx-no-such"`, `"qwerty-uiop"` or `"azurezzqxnosuch"` finds anything or gets a suggestion;
  - `"azure-zzqxnosuch"` or `"Azure zzqxnosuch"` finds anything;
  - `"azure"` returns the whole catalogue;
  - `"azure"` or `"edmx"` gets a suggestion;
  - the source does not load.
- **Runtime:** the same as the other search fixtures. The scorer imports the `.ts` modules through Node type stripping (Node 22.18 or later, falling back to `/usr/local/bin/node`). It needs no `node_modules` and no build. It prints 0 on an empty tree.
- **How to move it honestly:** a scratch copy of `lib/product-search.ts` with two changes scores 13/13 and keeps every guard at 0:
  1. `matchesProductQuery` splits the query on `[\s-]+` instead of `\s+`.
  2. `searchableText` also matches each field with every non-letter, non-digit character removed (spaces included).

  Cover the change in `tests/product-search.test.mjs`. Do not edit catalogue copy or slugs to raise the count.
- Renaming a product or changing a slug changes the pool. Treat 13 as the count at `9cd9042`.

## Related Patterns

- [`2026-11-05-evolve-fixture-search-typo-tolerant.md`](2026-11-05-evolve-fixture-search-typo-tolerant.md): the fifth search fixture
- [`2026-11-04-evolve-fixture-search-punctuation-free.md`](2026-11-04-evolve-fixture-search-punctuation-free.md): the punctuation-stripped field variant this extends
- `tests/product-search.test.mjs`: the existing search behaviour tests

## Impact

- This score moves with any change to `matchesProductQuery`, `searchableText` or `suggestProductQuery`, and with any change to product names or slugs in `lib/site-data.ts`.
