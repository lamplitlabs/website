# Memory: Adding a product touches more than the catalog

**Date:** 2026-11-27  
**Type:** Pattern  
**Scope:** Catalog (`lib/site-data.ts`), cover art, site metadata, docs, tests, search fixtures  
**Resolution:** resolved (Hive addition, [feature spec](../features/hive-product-entry.md))  

## Summary

A new `products` entry gives the card, the detail page, the sitemap entry and the JSON-LD for free. The rest is hand-written and has rules that only the tests state. This is the list the Hive addition walked, the counterpart of the [retirement checklist](2026-10-31-product-retirement-checklist.md).

## Context

Hive (website `hivefleet.dev`) was added on 2026-11-27. Three things cost a rerun each and are not written anywhere else: a comment inside the entry, a stale `out/` folder, and where a card crops its cover.

## Details

Files to touch, in this order:

- `docs/features/<slug>-product-entry.md` first (AGENTS.md: no product code before the feature is documented), with the rollback.
- `lib/site-data.ts`: the entry. Put it after the last featured entry of its category.
- `public/covers/<slug>.svg`: 800×400.
- `app/layout.tsx`: the description that names every product, `keywords`, and the Open Graph and Twitter descriptions.
- `README.md` products table (a test compares it with the catalog) and `docs/context/product.md`.
- Tests: the entry, its search words, its exported page.

Rules the tests hold a new entry to:

- **`slug:` is the first line of the entry.** `tests/routes.test.mjs` splits the catalog on `{` followed by `slug:`. A comment between them fails "every product must be parsed". Put the comment above the `{`.
- **Slug tokens come from the name**, `metaDescription` is 50 to 160 characters and differs from `longDescription`, `lastUpdated` is not before `statusSince`, `url` is https without a trailing slash and unique.
- **"true" and "queue" must find nothing** in the product search (`tests/product-search.test.mjs`), so neither word may appear in a name, title, description, tag, long description or highlight. The search matches substrings.
- **A product that is not a web app sets `operatingSystem`**, or its JSON-LD says "Web".
- **In development** needs `trackingDoc` and `roadmapNote`; **Live** needs neither.

Things that are not tests:

- **Rebuild before reading `test:unit` failures.** With an `out/` folder from before the entry, twelve export tests fail (no page for the new slug). `npm test` builds first; `npm run test:unit` does not.
- **A card crops its cover** (`background-size: cover`). At 1440 wide a plain card shows the cover's rows 86 to 314 of 400 and a featured card rows 43 to 357; on a phone nearly all of it shows. Keep the mark and any caption between rows 104 and 290.
- **Featured cards come in pairs.** The grid has two columns and stretches a row to its taller card. An odd number of featured entries puts the last one beside a plain card, which then shows an empty band above its footer (121px at 1440 wide with Hive as the seventh). The filtered views already do this.
- **A four-letter slug widens the 404 "did you mean".** `/hire`, `/hide`, `/hike` and `/have` now offer Hive: one edit, same first and last letter.
- **The search fixtures count over the catalog**, so their raw scores rise with a new product while each fixture's scale stays what it was (for example `behaviour-search-typo-tolerant`: 51 of 52 cases became 56 of 58, on a scale of 52, which reads as a perfect score with two misses). Run the scorers before and after, and file the rescale for the RSI lead when a raw score passes its scale (`TASK-159` for Hive).

## Related Patterns

- [Retiring a product touches more than the catalog](2026-10-31-product-retirement-checklist.md)
- [Public product copy describes outcomes, not method](2026-09-11-public-copy-describes-outcomes-not-method.md)
- [Naming follows existing artefacts](2026-09-10-naming-follows-existing-artefacts.md): Hive is named Hive; `hivefleet.dev` is its domain only.

## Impact

- Anyone adding a product should walk this list before `npm run check`.
