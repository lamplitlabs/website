# Feature: Catalog-Aligned Visible Homepage Copy

**Date:** 2026-09-09
**Status:** Done in worker; awaiting human review and merge
**Delivered:** 2026-09-09 (local worker only)
**Owner:** Lamplit Labs
**Tier:** 0 - four literal copy corrections on existing rendered surfaces
**Worker starting commit:** `e757e942e45fa46d2c024c706d66701da31fcfe2`
**Job:** `job-20260909T061008Z-12f9c2`

## Catalog Source and Scope

The shipped Amistio entry in [`lib/site-data.ts`](../../lib/site-data.ts) describes a visual AI agent builder; its metadata also uses "visual AI agents". [`docs/context/product.md`](../context/product.md) follows that catalog. [`homepage-product-metadata.md`](homepage-product-metadata.md) documents the matching metadata repair and the intentional external canonical URL.

Align only the following four visible homepage phrases with that existing catalog. This is one variable, visible catalog positioning, not new positioning, behavior, or a change to shipped/planned claims. No Tier 0 plan file or ADR is needed.

| Existing surface | Replace exactly | With exactly |
| --- | --- | --- |
| `components/home/hero-section.tsx`, paragraph | `enterprise agent governance with Amistio` | `the visual AI agent builder Amistio` |
| `components/home/about-section.tsx`, Germany and beyond item | `enterprise agent governance` | `visual AI agents` |
| `components/home/about-section.tsx`, paragraph | `Amistio for governed enterprise agents` | `the visual AI agent builder Amistio` |
| `components/lamplit-illustration.tsx`, first label | `agent governance` | `visual AI agents` |

Preserve every other source byte in those components, including JSX, whitespace, classes, links, handlers, SVG coordinates, and derived dimensions. The old and new illustration labels each have 16 characters, retaining the 148-unit pill width and text x-coordinate of 74. The independently queued hero arrow accessibility change is a separate hunk and is not part of this correction; preserve any landed version without duplicating it.

Do not modify other product code, catalog data, metadata, canonicals, any of the nine products, scripts, dependencies, lockfiles, historical governance documentation, `.github/`, `docs/decisions/`, protected evolution files, analytics/consent/privacy, or deployment. Only these three component files and this feature note may be committed. No installation, push, publish, or merge is part of the work.

## Acceptance Criteria

- [x] Before product edits, reproduce exactly four stale visible phrases by rendering the actual `HeroSection`, `AboutSection`, and `LamplitIllustration` from the recorded worker starting commit with installed React and TypeScript.
- [x] An exact source comparison against that commit permits only the four literal replacements and this new feature note, with no other tracked or untracked changes.
- [x] Actual React server rendering changes the four stale phrases to zero, includes all four catalog-backed replacements, and is byte-for-byte unchanged after accounting for only those substitutions.
- [x] The illustration retains its 16-character label length, pill dimensions, text position, and all other SVG markup; the product catalog and rendered product section remain unchanged.
- [x] `npm run lint && npm run typecheck && npm run build` succeeds with installed dependencies only.
- [x] Parsing `out/index.html` confirms the four replacements on their intended surfaces and all nine product entries with their existing names, descriptions, and links.
- [x] The exported target surfaces and product section match actual React-rendered markup, disregarding only React hydration comments.
- [x] The job commit includes only the three scoped component files and this note for human review.

## Verification Evidence

### Recorded Baseline

The worker started clean at the commit recorded above, matching lead baseline `e757e94`. Installed Node.js `22.18.0`, React `19.2.8`, and TypeScript `5.9.3` rendered the real components and their real imports without mocks or package installation. The Hero paragraph contained one stale phrase, About contained two, and the illustration contained one: four total, with none of the requested replacements on those surfaces.

The baseline illustration retained `translate(145, 125)`, pill width `148`, height `28`, and text coordinates `74, 18`. The catalog contained nine products, and Amistio's canonical remained `https://www.amistio.com`.

### Correction Method

Load baseline source from Git and compare each current component with the baseline plus exactly its permitted literal substitutions. Check the complete changed-file list as well. Render the actual components using installed TypeScript transpilation and React's `renderToStaticMarkup`; require exact HTML equality after the same substitutions. Render `ProductsSection` before and after and require complete equality.

After the existing checks, parse the static export with Python's standard-library HTML parser. Compare the Hero, About, illustration, and product-section element trees with the actual React rendering, excluding hydration comments rather than treating raw string matches inside scripts or metadata as visible-copy evidence. Require nine catalog-backed product headings, descriptions, detail links, and external links.

These are local server-rendering and static-export checks, not browser evidence. They do not exercise hydration, scrolling, animation, responsive layout, or deployment.

### Worker Results

The exact source allowance passed: four literal substitutions across three component files plus this feature note, with no other source changes. Actual component rendering reduced the stale-phrase count from four to zero and included all four replacements. Replacing only those phrases in the baseline HTML produced byte-for-byte equality with the corrected rendering, including the unchanged hero arrow markup and SVG geometry.

`npm run lint && npm run typecheck && npm run build` passed using the installed dependencies. The parsed `out/index.html` Hero, About, illustration, and product section matched their actual React-rendered element trees after ignoring hydration comments. Each requested replacement appeared once on its intended surface, and no stale phrase remained there.

All nine exported product entries retained their catalog names, descriptions, two detail links, and one external link each: `amistio`, `kenntnistrainer`, `fachsprachprufung`, `leben-in-deutschland`, `developer-tools`, `resume-builder`, `edmx-tools`, `azure-drawio-assets`, and `azure-compliance-matrix`. The entire rendered product section and catalog were unchanged. The complete source allowance also preserved metadata, canonicals, scripts, and every other out-of-scope file.

## Rollback Plan

If copy, unrelated markup, product entries, or existing checks regress, do not ship the correction. After committing, use `git revert <job-commit>` to revert only this job's commit; never reset the branch or revert unrelated work, including the separately owned hero accessibility hunk.

Rerun `npm run lint && npm run typecheck && npm run build` with installed dependencies. Repeat the exact source and actual React-rendering comparisons against the recorded worker starting commit, expecting the original four phrases to be restored and unrelated markup to remain unchanged. Inspect `out/index.html` again for the restored phrases and all nine original product entries. No dependency, metadata, canonical, or deployment rollback is needed because those surfaces are unchanged.
