# Memory: Evolve fixture `behaviour-search-verb-forms`

**Date:** 2026-11-24  
**Type:** Convention  
**Scope:** Product search (`lib/product-search.ts`), catalogue (`lib/site-data.ts`), self-improvement loop fixtures  
**Resolution:** open: the sitting-35 tree (`b2c7cda` + B-031 plural fix `6633b21`) scores 16 (isolated `hive evolve measure --tree`: 0.1600; 6 held-out at 1.0).
Only 7 of 44 verb forms list what their base verb lists.

## Summary

This fixture measures a thirteenth search behaviour. People type what they want to do: "learning German",
"practicing", "preparing", "testing", "developing", "converting". The copy and the chips mostly use the base verb
("learn", "practice", "develop", "convert"). Today an -ing or -ed form finds nothing:

- "learning" lists 0 products, while "learn" lists 2.
- "testing", "developing", "generating", "explaining" and "reviewing" all show "No products match".

## Context

- Sitting 35 added this fixture because selection pressure had run out. Once B-031 lands, every public behaviour
  fixture scores 1.0. The fixtures with headroom left measure SEO (held on open question 2), test hygiene or a starter
  rule.
- `wordForms` in `lib/product-search.ts` already returns the typed word plus its plural fallback. Matching and
  ranking both go through it, so one more form there changes both together.

## Details

- **Pool:**
  - Regular verbs: learn, practice, prepare, study, train, test, plan, translate, check, search, track, manage, model,
    map, chat, pass, design, deploy, code, develop, generate, convert, export, import, review, audit, answer, explain,
    host, compare, visualize, document. Each one that finds a product as typed adds its -ing and its -ed form.
  - Irregular verbs: build, run, write, read, speak, teach, understand. Each one that finds a product adds only its
    -ing form.
  - There are 44 forms at the sitting-35 tree.
- **Spelling:**
  - A final e is dropped before -ing, and e takes -d.
  - Consonant + y takes -ied.
  - A verb of 4 letters or fewer that ends consonant-vowel-consonant (b/d/g/m/n/p/r/t) doubles its last letter
    ("planning").
- **Hit:** the form lists every product the base verb lists. The score is the percentage of hits (`--scale 100`).
- **Score 0 (guards):**
  - fewer than 20 forms
  - `zzqxnosuch`, `zzqxnosuching`, `zzqxnosuched` or `azure zzqxnosuching` finds anything
  - `azure`, `azured`, `azuring`, `ring` or `red` lists every product
  - `languages` finds nothing
  - `tools` stops finding EDMX Tools
  - `draw.io` stops finding Azure Draw.io Assets
  - the source does not load
- **Loading:** the same as the other search fixtures. It imports `lib/site-data.ts` and `lib/product-search.ts`
  with Node type stripping (Node 22.18 or later, so `/usr/local/bin/node`). An empty tree prints 0.
- **Moving it honestly:** a scratch copy of `lib/product-search.ts` scores 100 with one change. `wordForms` also
  returns the word without -ing, -ed or -ied, for words of 5 or more letters whose stem keeps at least 3 letters:
  -ied becomes y, and a doubled final consonant is undoubled.
  - Cover it in `tests/product-search.test.mjs`.
  - Do not edit catalogue copy or tags to raise the count.

## Related Patterns

- [`2026-11-22-evolve-fixture-search-plural-words.md`](2026-11-22-evolve-fixture-search-plural-words.md): the
  twelfth search fixture and the same shape (an inflected word falls back to its base form in `wordForms`)

## Impact

- This score moves with any change to `fold`, `queryWords`, `wordForms` or `matchesProductQuery`, and with any copy
  added to or removed from `lib/site-data.ts`.
