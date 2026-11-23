# Feature: Eszett Product Entry, Cover and Journey Milestone

**ID:** FEAT-003
**Date:** 2026-10-31
**Status:** Proposed (branch for human review)
**Owner:** Lamplit Labs
**Tier:** 1 - catalog data, one static cover, one homepage milestone
**Task:** `TASK-046`
**Worker starting commit:** `2a3be828aa0190b2c79219bd1b9a0f6c4d5e586a`
**Job:** `job-20261031T021754Z-686bb4`

## Who It Serves

People who are learning German and visit lamplitlabs.com. They will find Lamplit Labs' new app,
Eszett, next to the other German-learning products (Leben in Deutschland, Kenntnistrainer,
Fachsprachprüfung). Eszett is a German tutor that runs entirely on the phone using an on-device
Lamplit Light language model, with Android first. Its website is live at
<https://eszett.lamplitlabs.com>, and the app is on Google Play's internal testing track. The
public Play listing follows Google's review.

## Scope

1. **Catalog entry** in [`lib/site-data.ts`](../../lib/site-data.ts): a `products` entry with slug
   `eszett`, placed directly after `leben-in-deutschland`. It has status `"In development"`
   (with `statusSince`, `trackingDoc` and `roadmapNote`, as the existing tests require for that
   status), category `Education` and `featured: true`. The copy comes from TASK-046. Like the
   other Education products it has no `schema` block, so the JSON-LD falls back to the defaults
   in `app/layout.tsx`, with one exception: `operatingSystem` (see "Structured Data Platform"
   below).
2. **Cover** at [`public/covers/eszett.svg`](../../public/covers/eszett.svg): 800×400 like the
   other covers (following the `leben.svg` pattern of a background gradient, a subtle grid and a
   centred motif). The motif is a large white **ß** on a Königsblau radial gradient from
   `#5F7BFF` (top right) to `#2442C6`, captioned "Eszett" in white and
   "German tutor · offline" in `#E7EBFB`. The SVG is hand-drawn and embeds no PNG. Covers load
   through `<img>`, so the SVG can't use the site's web fonts. The glyph uses a serif font stack
   that starts with the site's display face (Fraunces).
3. **Journey milestone** in
   [`components/home/journey-section.tsx`](../../components/home/journey-section.tsx), placed
   after "Lamplit Light: our AI lab": *Eszett: a German tutor on the phone* (2026).
4. **README product table**: one row for Eszett. The README table drift tests in
   `tests/site-data.test.mjs` require a row, with a matching status marker, for every product in
   `lib/site-data.ts`.

## Structured Data Platform

This section lifts the "defaults only" JSON-LD scope of item 1 for one field.

- The SoftwareApplication JSON-LD `operatingSystem` follows the product's real platform. A
  product sets it with the optional `operatingSystem` field of `Product` in
  [`lib/site-data.ts`](../../lib/site-data.ts). Without the field it defaults to `"Web"`.
- Both JSON-LD builders read the field the same way (`product.operatingSystem ?? "Web"`): the
  per-page `ProductJsonLd` in `app/products/[slug]/page.tsx` and the site-wide product list in
  `app/layout.tsx`. Otherwise one page would describe the same app as two platforms.
- Eszett sets `operatingSystem: "Android"`. It is an Android app that runs offline on the phone
  ([product context](../context/product.md), Current Products row "Eszett": "Android app
  (Android first)"). The other products keep the `"Web"` default. Set the field on another
  product only after its platform is recorded in `docs/context/product.md`.
- No other JSON-LD field and no visible page copy changes.

## Deviations From the Brief (Forced by Existing Checks)

- The brief's `metaDescription` is 200 characters. `tests/site-data.test.mjs` caps every
  product's `metaDescription` at 160 characters, so a shorter version keeps the same claims
  (A1–C2, on-device tutor, grammar, conversations, speaking practice, mock exams, offline,
  private, no subscription) and drops only the list of exam names, which the long description
  and highlights already give.

## Out of Scope

No other copy, no new categories, no changes to hero, layout or JSON-LD code, and no
dependencies or deployment changes. The site-wide keyword and description strings in
`app/layout.tsx` still name the older products; updating them is a separate copy change.

## Rollback

Revert the single commit. The entry, the cover file, the README row and the milestone are
independent additions, and nothing else refers to them.

## Acceptance Criteria

- [ ] `/products/eszett` is exported with the Eszett cover, highlights and roadmap note, and its
      canonical URL is the internal `/products/eszett` path (as for every In development product).
- [ ] The homepage product grid lists Eszett under Education, and the journey shows the new
      milestone after "Lamplit Light: our AI lab".
- [ ] The exported `/products/eszett` page's JSON-LD for Eszett says
      `"operatingSystem":"Android"`. A web product's page (e.g. `/products/light`) still says
      `"Web"` for that product (checked in `tests/routes.test.mjs`).
- [ ] `npm run check` (lint → typecheck → build → all tests, including `tests/site-data.test.mjs`
      and the out/ export tests in `tests/routes.test.mjs`) passes.
