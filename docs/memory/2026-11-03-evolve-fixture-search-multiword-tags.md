# Memory: Evolve fixture `behaviour-search-multiword-tags`

**Date:** 2026-11-03  
**Type:** Convention  
**Scope:** Product search (`lib/product-search.ts`), catalog (`lib/site-data.ts`), self-improvement loop fixtures  
**Resolution:** resolved: `matchesProductQuery` matches word by word (AND); a local run of the same scoring gives 54/54 (was 3/54 at `404f87d`)  

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

## Follow-on fixture: `behaviour-search-stray-word` (registered 2026-11-04)

The same tag pairs also measure the "did you mean" hint that `b5e6408` added (`suggestProductQuery` in `lib/product-search.ts`). The search stays strict (AND), so one junk word still empties the results. The hint offers the query with that word dropped. Every other enabled fixture ties on `b5e6408`, so before this fixture the loop had no measure of this behaviour.

- **Registered:** 2026-11-04 as public metric fixture `behaviour-search-stray-word` (weight 1, scale 108), from experiment card `20261104T182619Z-borealis-10-2`. The scorer is the same `pulse evolve score metric --higher --scale 108 -- sh -c 'for n in node /usr/local/bin/node; …'` wrapper as `behaviour-search-multiword-tags`. Read it with `sqlite3 -readonly ~/.pulse/pulse.sqlite "select scorer_cmd from evolution_fixtures where project='lamplitlabs' and name='behaviour-search-stray-word'"`.
- **Registered scorer checked against regressions:** it scores 108 at `557cbd2`, 0 at `b5e6408~1`, 54 when `suggestProductQuery` only tries dropping the first word, and 0 when it also hints for queries that already match. It does not catch a tie-break flip (`<=` → `>`): tag-pair queries have only one dropping that matches, so that flip still scores 108. The unit test `did-you-mean: no suggestion when…` covers the tie-break instead.

- **Score:** take each product and each ordered pair of two different tags whose query `"<tag A> <tag B>"` already finds that product. Add the junk word `zzqxnosuch` after the pair and, separately, before it. That gives 2 queries per pair, 108 at `b5e6408`. A query scores when all of these hold:
  - the real `filterProductsByQuery` over the real `products` returns nothing;
  - `suggestProductQuery` returns `query` equal to the pair, as typed;
  - its `dropped` is the junk word;
  - its `products` include the product but not the whole catalogue.
- **Measured:** 108/108 at `b5e6408` (HEAD `dc7bac4`), 0/108 at `b5e6408~1` (no `suggestProductQuery`). Both runs used `/usr/local/bin/node` v22.18.0 with type stripping. The scale has no headroom at HEAD. The fixture guards against regressions and records a measured gain for this commit. It does not leave room for future gains.
- **What scores 0:**
  - `suggestProductQuery(products, q)` returns a hint for a nonsense query, where `q` is `"zzqx no such product 7"`, `"zzqx yyqx"` or the single word `"drawiozzqx"`;
  - it returns a hint for a query that already matches, such as the first two tags of a product;
  - `filterProductsByQuery(products, "Azure zzqxnosuch")` returns anything. If the strict match stops being strict, the hint is never shown;
  - the source does not load, or `suggestProductQuery` is missing.
- **Spot checks:** these are the same queries as the unit test `did-you-mean: a query with one stray word…` in `tests/product-search.test.mjs`:
  - `"drawio zzz"` suggests `"drawio"`;
  - `"zzqx Draw.io"` suggests `"Draw.io"`;
  - `"Security Azure zzqxnosuch"` suggests `"Security Azure"`.
- **Runtime:** the same as above. It needs Node 22.18 or later, no `node_modules` and no build.
- **How to move it honestly:** keep `filterProductsByQuery` strict and fix `suggestProductQuery`, covering the change in `tests/product-search.test.mjs`. Do not add tags, and do not special-case the junk word.
- **Card check:** `node --test tests/product-search.test.mjs` passes on HEAD and on any tree that keeps the did-you-mean tests, so it ties. The registered fixture's score is what moves: a later change that breaks the hint drops it below 108.

## Related Patterns

- [`2026-11-01-evolve-fixture-search-finds-features.md`](2026-11-01-evolve-fixture-search-finds-features.md): the first search behaviour fixture (now 37/37)
- `tests/product-search.test.mjs`: the existing search behaviour tests

## Impact

- Any change to how `lib/product-search.ts` tokenises or matches a query moves this score. So does any change to product `tags` in `lib/site-data.ts`.
- `behaviour-search-stray-word` also moves with any change to `suggestProductQuery`.
