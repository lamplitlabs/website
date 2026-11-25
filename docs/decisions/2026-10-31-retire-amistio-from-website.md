# Decision: Retire Amistio from the Lamplit Labs website

**Date:** 2026-10-31  
**Status:** Accepted (owner decision)  
**Authors:** Lamplit Labs  
**Affects:** Catalog (`lib/site-data.ts`), homepage copy, site metadata/JSON-LD, `public/`, README, tests

## Problem

Lamplit Labs is retiring Amistio, the visual AI agent builder at `amistio.com`. The owner's instruction is to first remove Amistio from the Lamplit Labs product list; `amistio.com` will afterwards redirect to `lamplitlabs.com` (handled outside this repository). While the catalog entry and the surrounding copy still present Amistio as a live product, visitors are promised a product that no longer exists and the homepage metadata keeps positioning the company around it.

## Options Considered

### Option 1: Remove the catalog entry and every "current product" mention (chosen)
**Pros:**
- The product grid, `/products/amistio`, sitemap, and SoftwareApplication JSON-LD all derive from the catalog, so one deletion removes them together.
- Hero, About, metadata, keywords, manifest, README, and context docs stop promising a retired product.

**Cons:**
- `/products/amistio` becomes a 404 (the near-miss suggestion on the 404 page has nothing to suggest for it).
- The `AI` category keeps a single product (Lamplit Light).

### Option 2: Keep Amistio listed with a "Discontinued" status
**Pros:**
- Preserves the detail page and its history.

**Cons:**
- `ProductStatus` has no such value; adding one is new behaviour for a product that will not come back.
- A card for a discontinued product on the homepage is noise for prospective customers.

### Option 3: Remove only the catalog entry
**Pros:**
- Smallest diff.

**Cons:**
- Hero, About, metadata, manifest, and README would keep naming Amistio - exactly the stale-copy problem the Resume Builder removal ran into (fixed later across `78e31fd`, `84d03d1`, `249bfd0`).

## Decision

We have decided to **remove Amistio from the catalog and from every surface that presents it as a current product, in one change** because:
1. The owner asked for Amistio to leave the product list, and the catalog is the single source of truth for cards, detail pages, sitemap, and structured data.
2. Removing the copy in the same change avoids the multi-commit cleanup that followed the Resume Builder removal.
3. The "Our Journey" timeline keeps "Amistio MVP launches" because it records history, not the current product list.

## Consequences

**Positive:**
- No surface on lamplitlabs.com presents Amistio as a product; metadata and JSON-LD match the catalog.
- `tests/hero-copy.test.mjs` now lists `amistio` and `agent builder` as stale phrases, so they cannot silently return to the hero.

**Negative:**
- `https://www.lamplitlabs.com/products/amistio` returns 404 after deploy; the `amistio.com` redirect is handled separately.

**Neutral:**
- `/covers/amistio.svg` is deleted with its only consumer.
- Tests that used `amistio` as an example slug now use `kenntnistrainer`; their behaviour is unchanged.

## Implementation Notes

- `lib/site-data.ts`: delete the `amistio` product object; `public/covers/amistio.svg` removed.
- `components/home/hero-section.tsx`, `components/home/about-section.tsx`, `components/lamplit-illustration.tsx`: copy no longer names Amistio or visual AI agents.
- `app/layout.tsx`: description, Open Graph/Twitter descriptions, Organization and WebSite JSON-LD descriptions, and the Amistio keywords (`Amistio`, `visual AI agent builder`, `app connectors`, `approval gates`, `AI agent platform`) removed; `public/manifest.json` description aligned with the Open Graph description.
- `app/not-found.tsx`, `tests/routes.test.mjs`: example slug in comments/fixtures changed to `kenntnistrainer`.
- `README.md`, `docs/context/product.md`: Amistio row removed; feature specs that prescribed the Amistio copy carry a dated addendum pointing here.
- No dependency, deployment, analytics, or consent changes.

## Inverse Edit / Rollback

Revert the change-set commit with `git revert`; the catalog entry and `public/covers/amistio.svg` return together, and the product page, sitemap entry, and JSON-LD reappear from the catalog. Do not reset the branch or revert unrelated concurrent work.

## Related Decisions

- [Lamplit Light Name and Homepage AI Section](2026-09-10-lamplit-light-name-and-homepage-ai-section.md) (Lamplit Light is now the only `AI` product)

## References

- Memory: [Product retirement checklist](../memory/2026-10-31-product-retirement-checklist.md)
