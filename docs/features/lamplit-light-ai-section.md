# Feature: Lamplit Light AI Section

**Date:** 2026-09-10  
**Status:** In development (this change set); awaiting human review and merge  
**Owner:** Lamplit Labs  
**Tier:** 2 - new homepage behavior: dedicated AI section, catalog entry, navigation link, and category filtering

## Overview

Add Lamplit Light to the Lamplit Labs website as the company's AI lab and product line for compact, sovereign models. The homepage gains a dedicated AI section, an AI navigation target, a Lamplit Light catalog entry, product category filtering, and refreshed copy that makes the company's AI side visible without changing deployment, analytics, consent, or dependencies.

## User Story

**As a** visitor evaluating Lamplit Labs  
**I want to** understand the company's AI lab, its family of one-job-per-model releases, and where to follow the work  
**So that** I can distinguish Lamplit Labs' AI capability from its existing products and reach the AI property when it becomes public.

## Requirements

### Functional Requirements

- Add a required `category: ProductCategory` field to each catalog product in [`lib/site-data.ts`](../../lib/site-data.ts), backed by `productCategories` with the categories `AI`, `Education`, `Developer Tools`, `Azure`, and `Career`.
- Categorize existing products as follows: Amistio -> `AI`; Kenntnistrainer, Fachsprachprufung, and Leben in Deutschland -> `Education`; Developer Tools and EDMX Tools -> `Developer Tools`; Resume Builder -> `Career`; Azure Draw.io Assets and Azure Compliance Matrix -> `Azure`.
- Add the Lamplit Light product after Amistio with slug `light`, title `AI that runs where you are`, URL and canonical `https://ai.lamplitlabs.com`, cover `/covers/light.svg`, tags `Sovereign AI`, `Small Models`, and `On-device`, category `AI`, `featured: true`, and status `In development`.
- Add `{ label: "AI", href: "#ai" }` between Products and About in `navLinks`; header desktop/mobile navigation and footer navigation consume that shared data.
- Add `components/home/ai-section.tsx` with `id="ai"` and render it between `WhyLamplitSection` (`#our-story`) and `ProductsSection` (`#products`) in [`app/page.tsx`](../../app/page.tsx).
- Add `ai` to the homepage IntersectionObserver `sectionIds` so the current-section navigation highlight covers the new AI section.
- Present Lamplit Light with the eyebrow `Lamplit Light`, heading `AI that runs where you are.`, the sovereign-AI lead, five runtime targets, the six-step build story, the model-family card (one job per model, `light-<purpose>-<version>`, what every release lists, where models run), and outbound CTAs to `https://ai.lamplitlabs.com`, `https://ai.lamplitlabs.com/try` ("Try a model in your browser"), and the Lamplit Labs Hugging Face organisation (`https://huggingface.co/lamplitlabs`) using `OutboundLink` with tracking context `ai_section` and tracking targets `light`, `light_try`, and `huggingface`.
- Keep the homepage generic about the model family: no single model (such as the German tutor) is the headline of the AI section, the card, a CTA, the cover, or the journey copy. Individual models are the AI site's job; the product detail page may name the first model as the family's origin.
- Provide an internal CTA to `/products/light` from the AI section.
- Add the Hugging Face organisation to `socialLinks`/`SocialLinks` (`huggingface`) and to `socialPlatforms` with a monochrome brand icon in [`components/icons.tsx`](../../components/icons.tsx), so it appears wherever the shared social row renders (hero social bar, contact section, footer) and in the Organization JSON-LD `sameAs` list derived from `socialLinks`.
- Modernize the hero, header, products grid, journey/about/footer copy, and shared CSS utilities only as needed to introduce the AI story and keep the homepage visual language coherent.
- Add `/products/light` to [`public/sitemap.xml`](../../public/sitemap.xml) and update [`app/layout.tsx`](../../app/layout.tsx) metadata so Lamplit Light is included in descriptions and keywords; product JSON-LD remains derived from the catalog.

### Non-Functional Requirements

- **Accessibility:** Category filter chips must be keyboard-operable buttons with `aria-pressed`; existing product card action labels, named hero scroll link, mobile scroll lock, mobile expanded state, and `aria-current` current-section behavior must be preserved.
- **Motion:** The five-stage build pipeline may animate with CSS only (a light travelling the rail, stage pings and flashes on one shared 8s cycle) and must honor `prefers-reduced-motion` with a non-animated fallback: the rail and stage list stay fully readable with every animation disabled.
- **Contrast:** Amber-on-dark accents, glass badges, and CTA states must maintain WCAG AA contrast.
- **Performance:** Add no runtime dependencies; keep the site compatible with Next.js static export and avoid copying measurement numbers from the AI site that can go stale.
- **Privacy and analytics:** Cookie consent, analytics wiring, and outbound-link tracking behavior remain unchanged except for the new `ai_section` tracking context and the new `huggingface` tracking target in the shared social rows.
- **Theme support:** The new section, hero/header refresh, product filters, and footer copy must work in both light and dark themes.

## Scope

- Product catalog, social links, and navigation data in [`lib/site-data.ts`](../../lib/site-data.ts)
- Homepage rendering in [`app/page.tsx`](../../app/page.tsx)
- Homepage components in `components/home/`, including the new `components/home/ai-section.tsx`
- Shared social platform list and brand icons in [`components/social-platforms.ts`](../../components/social-platforms.ts) and [`components/icons.tsx`](../../components/icons.tsx)
- Product grid and products section filtering in [`components/product-grid.tsx`](../../components/product-grid.tsx) and [`components/home/products-section.tsx`](../../components/home/products-section.tsx)
- Shared homepage styling utilities in [`app/globals.css`](../../app/globals.css)
- Metadata in [`app/layout.tsx`](../../app/layout.tsx)
- Static assets and export discovery in [`public/covers/light.svg`](../../public/covers/light.svg) and [`public/sitemap.xml`](../../public/sitemap.xml)
- PULSE documentation for the feature, decision, product context, architecture, README, and memory

## Out of Scope

- Building, deploying, or changing the AI site at `ai.lamplitlabs.com`
- Model training, distillation pipeline changes, benchmarks, release gates, or ONNX export work
- DNS setup for `ai.lamplitlabs.com`
- Analytics provider, cookie consent, privacy policy, or event schema changes
- Internationalization or German-language website copy
- Dependency, lockfile, CI, Vercel, or deployment configuration changes

## Interface and Data Changes

- `Product` gains required `category: ProductCategory`.
- `ProductCategory` is `"AI" | "Education" | "Developer Tools" | "Azure" | "Career"`.
- `productCategories` defines the filter order used by the homepage product grid.
- `navLinks` gains `{ label: "AI", href: "#ai" }`; consumers should continue reading shared navigation data instead of hard-coding menu entries.
- `SocialLinks`/`socialLinks` gain `huggingface: "https://huggingface.co/lamplitlabs"`; `socialPlatforms` gains the matching `Hugging Face` entry, so every consumer of the shared social row and the Organization `sameAs` list picks it up without further edits.
- The homepage gains a new same-document section target, `id="ai"`, and `sectionIds` must include `ai` for current-section tracking.
- Lamplit Light is represented once in `lib/site-data.ts`; future renames should change that catalog object first.

## Edge Cases

- `ai.lamplitlabs.com` now resolves (Vercel DNS) and serves the AI site, so Lamplit Light is `Live` with `creativeWorkStatus: "Published"` and its outbound action reads "Visit site"; if the host ever stops resolving, flip both fields back to `In development` in `lib/site-data.ts`.
- The homepage should not copy benchmark numbers from the AI site; the AI site generates numbers from measurements and duplicated static numbers would go stale.
- Product category filters cannot currently produce an empty category because every category has at least one product; if a future category is empty, the grid should render its empty state gracefully.
- With JavaScript disabled, the statically rendered product grid should still show all products.
- The Lamplit Labs Hugging Face organisation exists but has no public models yet; the homepage links to it as the organisation's presence ("Lamplit Labs on Hugging Face") and must not claim that released weights are already published there.
- The AI section's animation must not be the only way to understand the five-stage build pipeline.
- Public copy describes what a Lamplit Light model is and does (small, single-purpose, grounded in verified knowledge, measured before release, hosted by you), not how it is trained. The training method (distillation, teacher/student framing) stays out of the product entry, cover art, AI section, journey copy, metadata and JSON-LD.

## Acceptance Criteria

- [x] Lamplit Light appears as the second catalog product, has the documented status, category, tags, cover, canonical URL, and product detail route, and contributes to product JSON-LD through the existing catalog mapping.
- [x] The homepage includes a visible `#ai` section between `#our-story` and `#products`, and the shared nav exposes an AI link between Products and About in desktop, mobile, and footer navigation.
- [x] Current-section highlighting includes the AI section without regressing `aria-current` behavior for existing sections.
- [x] Product category chips include All plus all five categories, use buttons with correct `aria-pressed` state, and filter cards client-side while preserving card links, labels, statuses, tags, and outbound tracking.
- [x] Featured cards, status/tag badges, hero/header copy, journey/about/footer refreshes, and shared glass/lab-grid utilities render coherently in light and dark themes.
- [x] Existing accessibility repairs remain intact: named hero scroll link, product card action names, mobile menu scroll lock, mobile menu expanded state, and current-section `aria-current`.
- [x] Static export includes `/products/light`, and `public/sitemap.xml` includes `/products/light`.
- [x] Metadata descriptions and keywords mention Lamplit Light, with no claim that the AI site is live before DNS and status are updated.
- [x] The Hugging Face organisation link (`https://huggingface.co/lamplitlabs`) renders in the hero social bar, contact section, footer, AI section CTA, and the Organization JSON-LD `sameAs` list, with the accessible name `Hugging Face` on icon-only links.
- [x] The homepage presents Lamplit Light as a model family (one job per model) rather than a single model: no tutor-specific headline, CTA, cover label, or journey copy; the `/try` CTA reads "Try a model in your browser".
- [x] No new dependencies, lockfile changes, deployment changes, analytics provider changes, or cookie-consent changes are introduced.

## Immersive Visual Refinement (2026-09-11)

**Tier:** 0 - decorative polish of the existing homepage; no new product,
navigation, catalog, or data behavior. The accepted decision's visual refresh
remains the controlling scope.

**Status:** Done (local implementation; not a deployment)

**Delivered:** 2026-09-11

Give the homepage a more immersive, three-dimensional presentation without
replacing its warm Lamplit identity: a prominent sculptural globe beside the
hero copy, softly lit perspective surfaces, tactile product cards, and a
layered model-on-device illustration in the AI section. Keep the existing
headings, product facts, five-stage build story, CTAs, destinations, accessible
names, filtering, themes, and tracking intact.

Depth must be visible at rest, not only on hover. Pointer tilt is optional
decoration for fine pointers; it must not intercept links, require dragging,
add tab stops, or change touch scrolling. Reduced-motion users receive a
composed static scene with no pointer parallax or looping animation. Canvas
work must pause when offscreen or the document is hidden, cap pixel density,
and release observers, listeners, and animation frames on cleanup. All content
must remain available without JavaScript.

Use existing React, canvas, and CSS capabilities only. Do not add rendering
libraries, fonts, remote assets, dependencies, deployment changes, analytics
changes, or consent changes. Keep dimensional styling scoped so product detail
pages and unrelated controls do not inherit unintended transforms.

Acceptance covers visible depth on desktop and mobile in both themes,
readable copy and focus indicators, no horizontal overflow, all ten catalog
products and their category filters, preserved mobile-menu and current-section
behavior, and the static reduced-motion presentation. Run the existing lint,
typecheck, and export commands; inspect the rendered browser where available.

Before delivery, remove only this refinement's hunks and newly introduced
visual files if readability, navigation, motion preferences, export, or
performance regress and cannot be repaired. Preserve unrelated working-tree
changes. After a commit, use a scoped `git revert` instead of resetting the
branch. No dependency or deployment rollback is needed.

### Delivery Evidence

The hero now has an illuminated copper globe with depth-sorted orbital
hardware, a raised platform, and a CSS sculpture fallback. Product cards use
the shared `TiltSurface` with stationary layout wrappers, bounded fine-pointer
rotation, tracked highlights, and 44px footer actions. The AI illustration
uses perspective-separated device, circuit, glass, and model layers. The
floating header retains the existing navigation and menu behavior.

The header's theme-dependent markup is stable through hydration before
displaying the saved theme. Shared reveals leave content visible without
JavaScript, and their entrance transforms do not persist over nested 3D
surfaces. Reduced-motion overrides keep the composed depth while removing
movement. Light-theme accent and muted text colors are scoped to the homepage
for readability; product detail styling is not redesigned.

`npm run lint && npm run typecheck && npm run build` passed with the existing
dependencies, producing all 14 static pages. A local harness using the actual
TypeScript/React components and generated HTML passed 174 assertions for
catalog content, category controls, exact accessible action names, link
destinations, development/coming-soon/empty branches, section order, metadata,
all ten product detail exports, and unchanged protected product behavior.

The installed Edge browser passed 80 assertions across both themes, 320px,
390px, 768px, 1024px, and 1440px layouts, keyboard category activation, pointer
tilt and reset, pending-frame cleanup on filtering, theme switching, the mobile
menu breakpoint, offscreen canvas suspension, runtime motion preferences,
and a 3x display emulation with canvas density capped at 2. Visibility and
context-loss/recovery handling used controlled browser events, not a claim of
real GPU failure. No-JavaScript and reduced-motion views retained all content.

The actual `out/` export was also served locally and rendered in desktop,
mobile, reduced-motion, and no-JavaScript modes, including the Lamplit Light
detail page. These views had no horizontal overflow or runtime/hydration
errors. No dependencies, catalog facts, links, analytics, consent, deployment
configuration, or product publication states were changed.

## Verification Plan

Verified on 2026-09-10 with `npm run lint && npm run typecheck && npm run build`, an export-assertion script over `out/` (35 checks: section order, nav links, preserved aria-labels, JSON-LD `sameAs`, no metric-like numbers in the AI section, `/products/light` export, sitemap, cover, Hugging Face links), and headless-browser screenshots of the homepage in dark/light/mobile plus `/products/light`.

The lead runs:

```bash
npm run lint && npm run typecheck && npm run build
```

After the static export, inspect `out/index.html` for the `#ai` section, the AI navigation link, and ten product entries. Confirm `out/products/light.html` exists. If a headless browser is available, capture homepage screenshots in light and dark themes and confirm the AI section, hero/header treatment, product filters, and footer refresh render without contrast or layout regressions.

## Related Decisions

- [Decision: Lamplit Light Name and Homepage AI Section](../decisions/2026-09-10-lamplit-light-name-and-homepage-ai-section.md)
- [Feature: Navigation Current Section](navigation-current-section.md)
- [Feature: Hero Scroll Link Accessibility](hero-scroll-link-accessibility.md)
- [Feature: Product Card Action Accessibility](product-card-action-accessibility.md)
- [Feature: Catalog-Aligned Visible Homepage Copy](homepage-catalog-copy.md)
- [Feature: Catalog-Aligned Homepage Product Metadata](homepage-product-metadata.md)

## Rollback Plan

Revert the change-set commit or commits with `git revert`; do not reset the branch or discard concurrent worker changes. No dependency, config, or deployment rollback is required.

If only the Lamplit Light product must be pulled, delete its object from `lib/site-data.ts`, remove its sitemap `<url>`, and remove `public/covers/light.svg`; the generated product page and product JSON-LD disappear with the catalog entry. The `category` field and AI nav link are additive and can remain unless they are part of the rollback trigger.

## Open Human Steps

- [x] Owner: point `ai.lamplitlabs.com` at the Vercel project for the AI site. Verified 2026-09-17: the host resolves through Vercel DNS (`dig +short ai.lamplitlabs.com` returns a `vercel-dns` CNAME and A records), `https://ai.lamplitlabs.com` answers HTTP 200 with the title "Lamplit Labs AI - models you can host yourself", and `https://ai.lamplitlabs.com/try` answers 307 to the Hugging Face space. The homepage CTAs no longer lead to an unresolved host.
- [ ] Owner: flip Lamplit Light `status` to `"Live"` and `schema.creativeWorkStatus` to `"Published"` in `lib/site-data.ts` now that the AI site is reachable. This is the only remaining blocker for marking this feature Shipped; the catalog entry still says "In development" until the owner confirms the site is meant to be public.
- [ ] Owner: confirm or change the name "Lamplit Light"; the product name lives in `lib/site-data.ts` for a one-line rename.
- [ ] Optional: rename the `Project-light` folder and `copilot-distill` package in the source repo to match the public product line.

## Success Metrics

- Visitors can identify Lamplit Light as a Lamplit Labs AI offering from the homepage before reaching the product grid.
- Visitors can filter the catalog by category and still reach every product's detail and outbound links.
- The main site remains honest about AI-site availability and does not publish stale benchmark numbers.
