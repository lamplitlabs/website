# Memory: Evolve fixture `behaviour-search-inflected-typos`

**Date:** 2026-11-28  
**Type:** Convention  
**Scope:** Product search (`lib/product-search.ts`), catalogue (`lib/site-data.ts`), self-improvement loop fixtures  
**Resolution:** open: HEAD (`e554505` plus the agets/assts fix) scores 47 (37 of 78 typos recovered)

## Summary

This fixture measures a fourteenth search behaviour. People make a typo in the word as they actually type it,
which is often a plural or an -ing form: "develping", "leanring", "tetsing", "integrtions", "certifiations",
"devces", "souces". The search handles each move alone: it finds "developing" (verb forms), "integrations"
(plurals), and it corrects a one-letter typo of a word in the catalogue ("complance" -> "compliance"). It does not
combine them. "develping" shows "No products match" with no "Showing results for ... instead" hint, while
"developing" lists five products.

## Context

- `suggestSpelling` in `lib/product-search.ts` compares the typed word only with words that occur in the catalogue
  copy. "developing" and "integrations" are not in the copy, so a typo of either has no candidate one edit away.
- When this fixture was added, the other thirteen behaviour fixtures scored 1.0 on the tree with the agets/assts
  fix. No behaviour fixture had headroom, and every kept row since B-033 moved one fixture only.

## Details

- **Pool:** 30 fixed English nouns in the plural (training, language, integration, certification, device,
  source, ...) and 30 fixed everyday verbs in their -ing form (learn, test, develop, generate, review, build,
  teach, ...). A form takes part when it has 7 or more letters and lists at least one product but not all of them.
- **Typos:** each form yields up to two typos at its middle: one letter dropped, and two neighbouring letters
  swapped. A typo that occurs anywhere in the catalogue copy is skipped.
- **Hit:** the typo, searched directly or through `suggestProductQuery`, lists every product that the correct
  form lists, and not the whole catalogue. The score is the percentage of hits (`--scale 100`). It is 0 when
  fewer than 30 typos qualify.
- **Score 0 (guards):**
  - `zzqxnosuch`, `zzqxnosuching`, `zzqxnosuchs` or `qwertyuiops` finds or suggests anything
  - `azure zzqxnosuching` finds anything
  - `azure` or `trainings` gets a suggestion (both match already)
  - `tools` stops finding EDMX Tools
  - `suggestProductQuery` is missing, or the source does not load
- **Loading:** the same as the other search fixtures. It imports `lib/site-data.ts` and `lib/product-search.ts`
  with Node type stripping (Node 22.18 or later, so `/usr/local/bin/node`). An empty tree prints 0.
- **Moving it honestly:** in a scratch copy, `suggestSpelling` also adds the plural and the -ing form of each
  catalogue word of 4 or more letters to its vocabulary. That scores 85 and leaves the other thirteen behaviour
  fixtures at full scale.
  - Cover it in `tests/product-search.test.mjs`.
  - Do not edit catalogue copy or tags to raise the count.

## Related Patterns

- [`2026-11-05-evolve-fixture-search-typo-tolerant.md`](2026-11-05-evolve-fixture-search-typo-tolerant.md):
  one-letter typos of catalogue words.
- [`2026-11-22-evolve-fixture-search-plural-words.md`](2026-11-22-evolve-fixture-search-plural-words.md):
  plurals typed correctly.
