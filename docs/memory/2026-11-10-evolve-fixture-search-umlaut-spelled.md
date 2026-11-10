# Memory: Evolve fixture `behaviour-search-umlaut-spelled`

**Date:** 2026-11-10  
**Type:** Convention  
**Scope:** Product search (`lib/product-search.ts`), catalogue (`lib/site-data.ts`), self-improvement loop fixtures  
**Resolution:** open: HEAD `2ef904b` scores 0/4 (0)  

## Summary

This fixture scores an eighth search behaviour. Four products are for German learners (Kenntnistrainer, Fachsprachprüfung, Leben in Deutschland, Eszett). A visitor without a German keyboard writes an umlaut the way German itself spells it out: "ü" as "ue", "ä" as "ae", "ö" as "oe". Today that visitor finds nothing.

## Context

- `fold` in `lib/product-search.ts` strips the accent, so "ü" becomes "u". "prufung" finds Kenntnistrainer and Fachsprachprüfung.
- "pruefung", "kenntnispruefung", "einbuergerungstest" and "buergeramt" find nothing. At best the grid shows a "showing results for" hint from `suggestProductQuery`.
- The seven other search fixtures are saturated or measure other fields, so no fixture moved when this was the gap.

## Details

- **Pool:** every distinct word with ä, ö or ü in the searchable copy (name, title, description, tags, longDescription, highlights) of `products`. At `2ef904b` that is 4 words: kenntnisprüfung, fachsprachprüfung, einbürgerungstest and bürgeramt.
- **Hit:** `filterProductsByQuery(products, <word with ä→ae, ö→oe, ü→ue>)` lists every product whose copy has the word. The score is the percentage of hits, `--scale 100`.
- **Score 0 (guards):**
  - fewer than 3 words
  - the umlaut spelling ("prüfung") or the plain fold ("prufung") stops finding a product
  - "zzqxnosuch" finds anything, or "azure" finds every product
  - "true" or "queue" finds anything
  - "question", "goethe" or "dialogues" finds nothing (they already contain "ue"/"oe" in the copy)
  - the source does not load
- **Loading:** the same as the other search fixtures. It imports `lib/site-data.ts` and `lib/product-search.ts` with Node type stripping (Node 22.18 or later). An empty tree prints 0.
- **Moving it honestly:** a scratch copy of `lib/product-search.ts` with one change scores 100 and keeps every guard. The change: in `searchableText`, also add each field that has ä/ö/ü with them spelled out as ae/oe/ue (then folded), beside the folded fields. Folding the query instead ("ue"→"u") would break "question", "true" and "queue", so the copy side is the one to change.
  - Cover it in `tests/product-search.test.mjs`.
  - Do not edit catalogue copy to raise the count.
- Adding or removing German words with umlauts in the copy changes the pool. Treat 4 as the count at `2ef904b`.

## Related Patterns

- [`2026-11-07-evolve-fixture-search-card-labels.md`](2026-11-07-evolve-fixture-search-card-labels.md): the seventh search fixture
- [`2026-11-05-evolve-fixture-search-typo-tolerant.md`](2026-11-05-evolve-fixture-search-typo-tolerant.md): typos, which the did-you-mean hint covers in part
- `tests/product-search.test.mjs`: the existing search behaviour tests

## Impact

- This score moves with any change to `fold`, `searchableText` or `matchesProductQuery`, and with any German word with an umlaut added to or removed from `lib/site-data.ts`.
