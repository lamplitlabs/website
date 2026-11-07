# Memory: Evolve fixture `behaviour-search-card-labels`

**Date:** 2026-11-07  
**Type:** Convention  
**Scope:** Product search (`lib/product-search.ts`), catalogue (`lib/site-data.ts`), self-improvement loop fixtures  
**Resolution:** open: HEAD `583c75d` scores 7/18  

## Summary

The self-improvement loop now scores a seventh search behaviour that visitors notice. A visitor can type a label they see on the home page into the product search: a category tab ("Education", "Azure", "Developer Tools", "AI") or a card's status badge ("Live", "In development"). The search should then list every product that carries that label.

## Context

All six earlier search fixtures scored 1.0 at `583c75d`:

- `behaviour-search-finds-features`
- `behaviour-search-multiword-tags`
- `behaviour-search-punctuation-free`
- `behaviour-search-stray-word`
- `behaviour-search-typo-tolerant`
- `behaviour-search-joined-names`

B-025 (`2f305e8`, ranking a joined name as a name match) landed as neutral because no fixture had headroom left to show it.

At `583c75d`, `searchableText` reads the name, title, description, tags, long description and Key Features. It does not read `category` or `status`, so a label only matches when the same word happens to appear in the copy:

- "education" lists 2 of the 4 products under the Education tab. Kenntnistrainer and Fachsprachprüfung are missing.
- "live" lists only Eszett, whose status is "In development", because its copy says "live". None of the 8 Live products is listed.
- "in development" finds nothing. The did-you-mean hint then offers "in", which lists the whole catalogue.

The 7 hits at `583c75d` are the "ai", "developer tools" and "azure" categories, plus Leben in Deutschland and Eszett under "education". Each matches only because the word is also in a tag or in the copy.

## Details

- **Query pool (scale 18):** take each distinct `category` and `status` value in `products`, in lower case. Count one hit for each product that carries the label and is shown: 9 products × 2 labels = 18 at `583c75d`.
- **Shown:** the real `filterProductsByQuery(products, q)` returns the product. When it returns nothing, the real `suggestProductQuery(products, q)` counts instead, if its `products` include the product. A label whose result is the whole catalogue scores none of its products.
- **What scores 0:**
  - `"zzqxnosuch"` finds anything or gets a suggestion;
  - `"Azure zzqxnosuch"` finds anything;
  - `"azure"` returns the whole catalogue;
  - `"azure"` or `"edmx"` gets a suggestion;
  - the source does not load.
- **Runtime:** the same as the other search fixtures. The scorer imports the `.ts` modules through Node type stripping. That needs Node 22.18 or later, so it falls back to `/usr/local/bin/node`. It needs no `node_modules` and no build, and it prints 0 on an empty tree.
- **How to move it honestly:** a scratch copy of `lib/product-search.ts` with one change scores 18/18 and keeps every guard at 0. The change: add optional `category?: string` and `status?: string` to `SearchableProduct` and append both to the fields in `searchableText`.
  - Then "live" lists the 8 Live products and "in development" lists Lamplit Light and Eszett.
  - Cover it in `tests/product-search.test.mjs`. Do not edit catalogue copy, categories or statuses to raise the count.
  - The category tab and the search box combine (the search narrows `categoryProducts`), so the grid needs no change.
- Adding or removing a category or status value, or moving products between them, changes the pool. Treat 18 as the count at `583c75d`.

## Related Patterns

- [`2026-11-06-evolve-fixture-search-joined-names.md`](2026-11-06-evolve-fixture-search-joined-names.md): the sixth search fixture
- [`2026-11-01-evolve-fixture-search-finds-features.md`](2026-11-01-evolve-fixture-search-finds-features.md): the first search fixture, which counts the fields search reads
- `tests/product-search.test.mjs`: the existing search behaviour tests

## Impact

- This score moves with any change to `searchableText`, `matchesProductQuery` or `suggestProductQuery`, and with any change to the categories or statuses in `lib/site-data.ts`.
