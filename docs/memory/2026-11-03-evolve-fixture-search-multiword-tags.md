# Memory: Evolve fixture `behaviour-search-multiword-tags`

**Date:** 2026-11-03  
**Type:** Convention  
**Scope:** Product search (`lib/product-search.ts`), catalog (`lib/site-data.ts`), self-improvement loop fixtures  
**Resolution:** open (HEAD `404f87d` scores 3/54)  

## Summary

The self-improvement loop now scores a second user-facing search behaviour: a visitor who types two words that describe a product finds that product, whatever the word order.

## Context

The first behaviour fixture, `behaviour-search-finds-features`, reached 37/37 when `404f87d` made the search match highlights. It has no headroom left. The other enabled metric fixtures count tests, TODO markers and JSON-LD blocks, so they reward hygiene rather than search quality.

`filterProductsByQuery` matches the whole query as one substring. Each product card shows its tags as chips. When a visitor types two of those chips together, for example "Security Azure" for Azure Compliance Matrix or "Architecture Draw.io" for Azure Draw.io Assets, the search shows "No products match". At `404f87d`, 51 of the 54 two-tag queries fail this way.

## Details

- **Score:** for each product and each ordered pair of two different tags of that product, the query `"<tag A> <tag B>"` goes to the real `filterProductsByQuery` over the real `products`. A query scores when it returns its own product without returning the whole catalog. Scale 54 is the number of ordered tag pairs at `404f87d`. HEAD scores 3/54.
- **What scores 0:**
  - a nonsense query (`"zzqx no such product 7"`) returns anything;
  - one real word plus one nonsense word (`"Azure zzqxnosuch"`) returns anything, so an any-word (OR) match cannot win;
  - the source does not load.
- **Runtime:** the same as `behaviour-search-finds-features`. The scorer imports the two `.ts` modules with Node's type stripping, so it needs Node 22.18 or later. It needs no `node_modules` and no build.
- **How to move it honestly:** split the query on whitespace. A product matches when every folded word matches one of its searchable fields (name, title, description, tags, longDescription, highlights). Cover this in `tests/product-search.test.mjs`. Do not add tags or copy just to raise the count.
- The fixture's full request text and scorer are stored in Pulse (`pulse evolve fixture list --project lamplitlabs`).

## Related Patterns

- [`2026-11-01-evolve-fixture-search-finds-features.md`](2026-11-01-evolve-fixture-search-finds-features.md): the first search behaviour fixture (now 37/37)
- `tests/product-search.test.mjs`: the existing search behaviour tests

## Impact

- Any change to how `lib/product-search.ts` tokenises or matches a query moves this score. So does any change to product `tags` in `lib/site-data.ts`.
