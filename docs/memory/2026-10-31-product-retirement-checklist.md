# Memory: Retiring a product touches more than the catalog

**Date:** 2026-10-31  
**Type:** Pattern  
**Scope:** Catalog (`lib/site-data.ts`), homepage copy, metadata, docs  
**Resolution:** resolved (Amistio retirement, [ADR](../decisions/2026-10-31-retire-amistio-from-website.md))  

## Summary

Deleting a product object from `lib/site-data.ts` removes its card, detail page, sitemap entry, and SoftwareApplication JSON-LD, but the hand-written copy that names the product lives elsewhere and must be removed in the same change.

## Context

The Resume Builder removal (`3a50e8a`) left "career" claims behind and needed three follow-up commits (`249bfd0`, `84d03d1`, `78e31fd`). The Amistio retirement was done in one change by walking the list below first.

## Details

Grep the product name and its positioning phrase (e.g. `amistio|visual AI agent`) across the repository, then check each of these:

- `lib/site-data.ts`: the product object, and whether its `category` is now empty (remove the category too, as `249bfd0` did for `Career`).
- `public/covers/<slug>.svg`: delete with the catalog entry; `tests/smoke.test.mjs` and `tests/routes.test.mjs` only check that referenced covers exist, not for orphans.
- `components/home/hero-section.tsx`, `components/home/about-section.tsx`, `components/lamplit-illustration.tsx`: hand-written copy and the illustration's illuminated labels.
- `app/layout.tsx`: `metadata.description`, `keywords`, Open Graph and Twitter descriptions, Organization and WebSite JSON-LD descriptions.
- `public/manifest.json`: its `description` is a copy of the Open Graph description and is not derived from the catalog.
- `README.md` intro and products table; `docs/context/product.md` table.
- Tests that use the slug as an example (`tests/routes.test.mjs` near-miss fixtures, `app/not-found.tsx` comment); add the retired name to the `stale` list in `tests/hero-copy.test.mjs`.
- Feature specs in `docs/features/` that prescribed the old copy: add a dated addendum rather than rewriting the historical record.

Keep history that is not a product claim, such as the "Our Journey" timeline in `components/home/journey-section.tsx`.

## Related Patterns

- [Vercel static export root route](2026-09-06-vercel-static-export-root-route.md) uses a product URL in its production check; keep that slug pointing at a live product.

## Impact

- Anyone removing or renaming a product should run through this list before `npm run check`.
