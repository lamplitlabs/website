# Memory: Evolve fixture `behaviour-search-finds-features`

**Date:** 2026-11-01  
**Type:** Convention  
**Scope:** Product search (`lib/product-search.ts`), catalog (`lib/site-data.ts`), self-improvement loop fixtures  
**Resolution:** resolved by `404f87d` (search matches highlights; 37/37 at `404f87d`)  

## Summary

The self-improvement loop now scores one user-facing behaviour: a visitor who types a product's advertised feature into the homepage search box should find that product.

## Context

Every kept experiment so far (archive B-011, B-012, B-013) tied at the baseline. The enabled fixtures count tests, TODO markers and JSON-LD blocks, so they reward hygiene rather than what the site does for visitors. RSI sitting 15 added a behaviour fixture so an experiment that improves the product search can show up as a measured improvement.

Each product in `lib/site-data.ts` lists `highlights`. The detail page shows them under "Key Features" (`components/product/product-highlights.tsx`). The homepage search (`filterProductsByQuery` in `lib/product-search.ts`, wired into `components/product-grid.tsx`) matches name, title, description, tags and longDescription, but not highlights. At `72bebde`, typing "OpenAPI", "HIPAA", "ISO 27001" or "Bundesland" shows "No products match", even though EDMX Tools, Azure Compliance Matrix and Leben in Deutschland advertise exactly those features.

## Details

- **Score:** the number of highlight titles that, typed verbatim into the real `filterProductsByQuery` over the real `products`, return their own product without returning the whole catalog. Scale 37 (the highlight count at `72bebde`). HEAD scored 11/37 (0.2973) in `pulse evolve measure`'s isolated clone.
- **What scores 0:** a search that matches every product for any query (a nonsense query must return nothing), a catalog with no highlights, or source that does not load.
- **Runtime:** the scorer imports the two `.ts` modules with Node's built-in type stripping. That needs Node 22.18 or later (`/usr/local/bin/node` on the agent machine). The mise-pinned Node 20 cannot strip types, and the scorer then prints 0. The scorer needs no `node_modules` and no build. Both modules must stay free of runtime imports from npm packages for it to keep working.
- **How to move it honestly:** let the search also match each product's highlight titles and descriptions, and cover that in `tests/product-search.test.mjs` (checked by `npm run check`). Do not copy highlight words into tags or descriptions to game the count. That changes visible copy without improving the search.
- The fixture's full request text and scorer are in the Pulse store (`pulse evolve fixture list --project lamplitlabs`). This note explains them for anyone working in the repository.

## Related Patterns

- [`docs/features/homepage-catalog-copy.md`](../features/homepage-catalog-copy.md): catalog copy that the search reads
- `tests/product-search.test.mjs`: the existing search behaviour tests (name, title, tags, longDescription, diacritic folding)

## Impact

- Anyone changing `lib/product-search.ts` or the shape of `highlights` in `lib/site-data.ts` moves this score.
