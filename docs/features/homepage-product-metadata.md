# Feature: Catalog-Aligned Homepage Product Metadata

**ID:** FEAT-002
**Date:** 2026-09-08
**Status:** Merged (landed to main)
**Owner:** Lamplit Labs
**Tier:** 0 - copy-only correction
**Worker starting commit:** `99f9c01819c64669c9957f98e8443753c68a6643`
**Job:** `job-20260908T134123Z-5aebfa`

## Catalog Source

The shipped Amistio entry in [`lib/site-data.ts`](../../lib/site-data.ts), lines 57-115 at the starting commit, describes a visual AI agent builder with app connectors and approval gates. [`docs/context/product.md`](../context/product.md) follows this catalog. MCP tool execution, organization-owned agents, and supported customer-managed deployment remain planned in the catalog; this correction must not imply they are shipped.

## Copy-Only Scope

Change only eight Amistio positioning strings in [`app/layout.tsx`](../../app/layout.tsx):

- In `metadata.description`, `metadata.openGraph.description`, `metadata.twitter.description`, `organizationJsonLd.description`, and `websiteJsonLd.description`, replace `Amistio for enterprise agent governance` with `the visual AI agent builder Amistio`.
- Replace the three keywords `enterprise agent governance`, `governed enterprise agents`, and `governed MCP` with `visual AI agent builder`, `app connectors`, and `approval gates`, respectively.

All replacement vocabulary already appears in the catalog. Preserve every other string and all nine products, metadata titles, canonical URLs, schema shapes, images, the `productJsonLd` mapping, layout/providers, scripts, analytics, and consent behavior. Do not edit the catalog or the intentional `https://www.amistio.com` canonical URL, refactor metadata generation, or change dependencies, lockfiles, deployment, protected documentation, `.github/`, or tracking/privacy settings. This is an ordinary human-reviewed correction, not an evolution experiment; no ADR or implementation plan is needed.

## Acceptance Criteria

- [x] The eight stale positioning strings in `app/layout.tsx` are removed, with no source changes beyond the five description phrases and three keywords.
- [x] `npm run lint && npm run typecheck && npm run build` succeeds using installed dependencies only.
- [x] Inspection of `out/index.html` confirms that the standard, Open Graph, Twitter, Organization, and WebSite descriptions use the catalog's visual AI agent builder positioning, and that the three replacement keywords are exported.
- [x] The homepage retains all nine catalog products and their existing SoftwareApplication metadata; unrelated metadata, titles, URLs, images, and schema fields remain unchanged.
- [x] All nine product detail pages are exported with their existing product descriptions, titles, Open Graph/Twitter metadata, canonical URLs, and SoftwareApplication data, including Amistio's intentional external canonical URL.
- [x] Only `app/layout.tsx` and this feature note are included in the job commit.

## Verification

Compare the layout with the recorded starting commit to constrain the diff to the eight literal replacements. After the existing checks, parse the actual static HTML metadata and JSON-LD rather than treating build success as a copy assertion. Compare homepage descriptions with the catalog-backed replacements and product detail metadata with the unchanged catalog and route implementation.

### Worker Evidence (2026-09-08)

The existing lint, typecheck, and static-export build commands passed with installed dependencies. An exact source comparison against the starting commit confirmed eight literal replacements, zero remaining stale positioning strings, and no other layout changes; the catalog and product route source remained byte-for-byte unchanged.

Python's standard-library HTML parser and the installed TypeScript compiler inspected the generated HTML and metadata declarations without adding tooling. All five homepage descriptions exactly matched the approved catalog-backed replacements, and all three replacement keywords were exported. All nine product names remained rendered on the homepage, whose nine SoftwareApplication objects matched the starting catalog. Homepage titles, canonical/Open Graph URLs, social images, and unrelated Organization/WebSite fields were preserved.

The export contained exactly nine product detail pages: `amistio`, `kenntnistrainer`, `fachsprachprufung`, `leben-in-deutschland`, `developer-tools`, `resume-builder`, `edmx-tools`, `azure-drawio-assets`, and `azure-compliance-matrix`. Each page retained its catalog-derived description, title, Open Graph/Twitter metadata, canonical URL, images, and SoftwareApplication data. The exported Amistio canonical remained exactly `https://www.amistio.com`. These are local worker results, not a deployment claim.

## Rollback Plan

If metadata output, route coverage, product metadata, or existing checks regress, revert only this job's commit with `git revert <job-commit>`; do not reset the branch or revert unrelated work. The worker starting commit above is the reference for the original content. Rerun `npm run lint && npm run typecheck && npm run build` using installed dependencies, then inspect the restored homepage and all nine product exports against that reference. Do not commit a correction that fails these checks.
