# Memory: Evolve fixture `behaviour-search-punctuation-free`

**Date:** 2026-11-04  
**Type:** Convention  
**Scope:** Product search (`lib/product-search.ts`), catalog (`lib/site-data.ts`), self-improvement loop fixtures  
**Resolution:** open: HEAD `df17c70` scores 0/27  

## Summary

The self-improvement loop now scores a third search behaviour that visitors notice. A visitor can type a hyphenated or dotted product word without its punctuation ("drawio", "ondevice", "selfhosted", "doctorpatient") and still find the product that uses that word.

## Context

Both earlier behaviour fixtures are saturated. `behaviour-search-finds-features` scores 37/37 since `404f87d`. `behaviour-search-multiword-tags` scores 54/54 since `67048f0`. The other enabled metrics count tests, TODO markers and JSON-LD blocks, which is hygiene. Archive rows B-014 and B-016 kept no score change.

`fold()` in `lib/product-search.ts` folds case, diacritics and ß/æ/ø/đ/ł/œ/ð/þ, but it matches punctuation literally. The catalogue copy is full of compound words joined by "-", ".", "/" or "–": "Draw.io", "On-device", "self-hosted", "AI-powered", "doctor-patient", "pay-it-forward", "Encoder/Decoder", "A1–C2". At `df17c70` every one of these typed without its punctuation shows "No products match".

## Details

- **Score:** the scorer takes each word in a product's searchable copy (name, title, description, tags, longDescription, highlights) made of letters or digits joined by `-`, `.`, `/` or `–`. It strips the punctuation, lower-cases the word and de-duplicates it per product. Each query goes to the real `filterProductsByQuery` over the real `products`. It scores when it returns its product without returning the whole catalogue. Scale 27 is the number of (product, word) pairs at `df17c70`. HEAD scores 0/27.
- **What scores 0:**
  - a nonsense query (`"zzqx no such product 7"`), `"Azure zzqxnosuch"` or `"drawiozzqx"` returns anything;
  - a punctuated spelling stops working (`"Draw.io"` must still find Azure Draw.io Assets, `"on-device"` must find Eszett, `"self-hosted"` must find Lamplit Light);
  - the source does not load.
- **Runtime:** the same as the other two search fixtures. The scorer imports the `.ts` modules through Node's type stripping, which needs Node 22.18 or later; it falls back to `/usr/local/bin/node`. It needs no `node_modules` and no build.
- **How to move it honestly:** match each folded field a second time with its non-letter, non-digit, non-space characters removed, for example `field.replace(/[^\p{L}\p{N}\s]+/gu, "")`. Keep the per-word AND match and the existing letter folds. Cover the change in `tests/product-search.test.mjs`. A scratch copy with that one change in `searchableText` scores 27/27. Do not edit catalogue copy just to raise the count.
- Copy edits that add or remove compound words change the pool of queries. Treat the scale as the count at `df17c70`.
- Pulse stores the fixture's full request text and scorer (`pulse evolve fixture list --project lamplitlabs`).

## Related Patterns

- [`2026-11-01-evolve-fixture-search-finds-features.md`](2026-11-01-evolve-fixture-search-finds-features.md): the first search behaviour fixture (37/37)
- [`2026-11-03-evolve-fixture-search-multiword-tags.md`](2026-11-03-evolve-fixture-search-multiword-tags.md): the second search behaviour fixture (54/54)
- `tests/product-search.test.mjs`: the existing search behaviour tests

## Impact

- Any change to how `lib/product-search.ts` folds or matches text moves this score. So does any change to compound words in `lib/site-data.ts`.
