# Feature: Main Content Landmarks

**Date:** 2026-09-08
**Status:** Verified in worker; awaiting human review and merge
**Owner:** Lamplit Labs
**Tier:** 0 - semantic markup repair on shipped pages
**Worker starting commit:** `78809858a29b743e2e6cbc435845df469285dd2e`
**Job:** `job-20260908T194946Z-0f91f0`

## Baseline and Scope

The worker started with a clean worktree at the reported evidence revision.
Before product edits, `npm run build` succeeded using the already-installed
dependencies and generated all 13 static pages. A copy of that export was
retained outside the clone for the before/after comparison.

An installed-TypeScript AST inspection found no native `main` or `role="main"`
in `app/page.tsx`, `app/products/[slug]/page.tsx`, or `app/layout.tsx`.
Parsing the actual starting export with Next.js's installed HTML parser
confirmed zero main landmarks on the homepage and all nine catalog product
pages. Each page has one `h1`, one exported navigation element, and one footer.
The homepage has six content sections; every product page has five.

The single variable is main-landmark presence:

- In `Home`, enclose `HeroSection`, `WhyLamplitSection`, `ProductsSection`,
  `JourneySection`, `AboutSection`, and `ContactSection`, in that order, in one
  classless native `main`. Keep `Header`, `Footer`, and `EasterEggs` outside.
- In `ProductPage`, enclose the existing hero, cover showcase, about,
  conditional highlights, and CTA banner in one classless native `main`.
  Keep `ProductJsonLd`, the sticky navigation, and the footer outside.
- Preserve every child, text, class, section ID, heading, link, callback, and
  order. Preserve the existing product home-link label,
  `Back to Lamplit Labs home`, and all homepage effects, including the 768px
  mobile-menu scroll-lock repair.

Only the two page files and this note may change. Do not change `RootLayout`,
CSS, focus or navigation behavior, skip links, catalog data, metadata,
JSON-LD, tracking, analytics, consent, privacy, dependencies, lockfiles,
configuration, deployment, `.github/`, decisions, or protected evolution
files. This is an ordinary human-reviewed repair, not a new behavior or an
evolution experiment; no ADR or separate plan is required.

## Acceptance Criteria

- [x] The actual `out/index.html` and all nine catalog `out/products/*.html`
  pages each contain exactly one native, classless, non-nested `main`, with
  no additional `role="main"` landmark.
- [x] Each `main` contains the page's existing `h1` and all intended sections,
  in their original order. Page navigation and footer remain outside it;
  product JSON-LD and homepage header/easter eggs stay outside in source.
- [x] Unwrapping only the added `main` and undoing its indentation restores
  each page source exactly to the starting revision, including every effect
  and callback. Shared components, layout, styles, and catalog stay unchanged.
- [x] Comparing the actual exports after unwrapping the added `main` confirms
  unchanged content, section order/IDs/classes, text, links, nine product
  routes, metadata, JSON-LD, and product home-link labels. Generated
  runtime/build artifacts are handled separately from product content.
- [x] `npm run lint && npm run typecheck && npm run build` succeeds with
  installed dependencies only.
- [x] Available browser evidence is distinguished from source/static-export
  evidence. No tools are installed or permissions changed to obtain it.
- [x] The job commit contains only the two page files and this feature note.

## Verification Plan

Use Node, the installed TypeScript parser, and
`next/dist/compiled/node-html-parser`; do not add a test framework. Derive the
nine expected routes from the unchanged catalog and assert the export has
exactly that set. Compare each page to its own captured starting export.
Check landmark cardinality, ancestry, complete section coverage, navigation
and footer placement, and the repaired home-link label explicitly.

Compare the unwrapped content tree, section markup, headings, anchors,
metadata, and JSON-LD. Exclude generated Next.js bootstrap/Flight scripts,
their script preload references, and the document-level build-ID comment,
whose build hashes and serialized component tree may change. The homepage's
two `Logo` gradients use React `useId`, which changes with the component tree:
verify each unique generated ID still has exactly its own circle's
`url(#...)` reference in the same SVG before mapping that pair to its baseline
ID for comparison. Do not normalize section IDs, anchor attributes/text,
content, or JSON-LD differences. Compare generated CSS as well.
Restore the page source in memory by removing
the wrapper lines and their added indentation, then require byte-for-byte
equality with `git show` of the starting revision. This establishes that menu
effects, the `(min-width: 768px)` listener and cleanup, and Header callbacks
are untouched, separately from any rendered-browser exercise.

Installed baseline tooling: Node 22.18.0, Next.js 15.5.25, TypeScript 5.9.3,
React 19.2.8. No Playwright, Puppeteer, or jsdom is installed. Safari WebDriver
is present; report whether an actual browser session is available without
enabling remote automation or changing permissions.

## Worker Evidence (2026-09-08)

The baseline, Tier 0 scope, acceptance criteria, and rollback above were
documented before either product edit. The unchanged starting build and the
repaired build both generated all 13 static pages. After the repair,
`npm run lint && npm run typecheck && npm run build` passed: no ESLint
warnings/errors and no TypeScript errors. The CLI printed its existing
`next lint` deprecation notice; no tooling or dependency was changed.

### Actual Static Export

The catalog-derived route set matches the captured baseline exactly. All 11
exported HTML paths, including the existing 404 page, remain present; the
landmark assertions below cover the homepage and all nine product pages.

| Exported page | Main landmarks before / after | Sections inside main |
| --- | --- | --- |
| `index.html` | 0 / 1 | 6 |
| `products/amistio.html` | 0 / 1 | 5 |
| `products/azure-compliance-matrix.html` | 0 / 1 | 5 |
| `products/azure-drawio-assets.html` | 0 / 1 | 5 |
| `products/developer-tools.html` | 0 / 1 | 5 |
| `products/edmx-tools.html` | 0 / 1 | 5 |
| `products/fachsprachprufung.html` | 0 / 1 | 5 |
| `products/kenntnistrainer.html` | 0 / 1 | 5 |
| `products/leben-in-deutschland.html` | 0 / 1 | 5 |
| `products/resume-builder.html` | 0 / 1 | 5 |

**10/10 pages passed:** each has one attribute-free, non-nested native `main`,
no competing `role="main"`, and its one existing `h1` in the hero inside main.
All 51 content sections are direct children of their page's main, in baseline
order, with byte-identical parsed section markup. The homepage IDs remain
`our-story`, `products`, `journey`, `about`, and `contact`, following its
existing ID-less hero. Navigation precedes main and the footer follows it,
both outside. All 119 JSON-LD scripts remain outside main and match the
baseline both as raw markup and parsed JSON.

All 121 anchors retain their exact attributes, text, and order. Every product
nav home anchor still has `href="/"`,
`aria-label="Back to Lamplit Labs home"`, both SVG icons, and the
`hidden sm:inline` span. Headings, metadata (including canonical, Open Graph,
and Twitter entries), images, and remaining document content match.

A literal document comparison initially exposed two kinds of generated
serialization differences, not product-content changes: Next.js's build-ID
comment/runtime scripts, and React's tree-dependent IDs for the homepage
header/footer logo gradients. These were handled only as specified above.
The two homepage gradient IDs changed from `logo-glow-_R_l2ltlb_` and
`logo-glow-_R_55gltlb_` to `logo-glow-_R_ailtlb_` and
`logo-glow-_R_2imltlb_`. Each remains unique, with exactly one matching circle
fill reference in its own unchanged SVG. Only those two ID/reference pairs
were mapped back for comparison; product logo IDs and every other ID stayed
unchanged. No section, link attribute, text, or JSON-LD difference was
normalized away.

After unwrapping main and handling those framework artifacts, the complete
remaining parsed documents match the starting export. SHA-256 of the JSON
array of `[relativePath, comparedHtml]`, ordered homepage first then sorted
catalog slugs, is identical before and after:
`96023a66cd74f65dfa59ce5b7e46898624348147d48e1bdbdc6e3ac73a73df67`.
The exported CSS filename and bytes also match:
`4d881cf6ea37bf3d.css`, SHA-256
`e8896aee0a0b659fd2375f05cbdcb42205415fc8a447cf7ec11874ad293450c7`.

### Source and Navigation Preservation

Removing only the two wrapper lines and their two-space child indentation
restores each page source byte-for-byte to `git show` of the recorded starting
commit. AST assertions also confirm the exact requested component order and
outside siblings: `Header`, `Footer`, and `EasterEggs` for Home;
`ProductJsonLd`, sticky nav, and footer for ProductPage.

All four Home effects are therefore unchanged, including overflow
lock/release, the `(min-width: 768px)` listener and cleanup, scroll tracking,
and intersection observers. Header menu-button/link callbacks, theme props,
and responsive classes are unchanged. This is source-preservation evidence,
not a newly executed interactive-menu or effect simulation. Shared
components, `RootLayout`, catalog, styles, metadata/JSON-LD logic, and every
other tracked source file remain untouched.

### Browser Availability and Bounded Reflection

**Rendered-browser evidence unavailable:** the installed Safari 26.6.2
WebDriver answered its status endpoint, but creating a session returned
`session not created`: Safari requires "Allow remote automation" to be
enabled. No permission or setting was changed, and the job's driver process
was stopped. No browser packages were installed. No rendered layout,
accessibility-tree, or interactive navigation result is claimed.

Execution used GitHub Copilot CLI's normal permissions, unsandboxed in the
throwaway clone. The reusable observation is that wrapper-only changes can
alter React `useId` serialization; validate the ID/reference relationship
rather than hiding arbitrary ID differences. Reflection remained bounded to
this repair and its evidence. This repository has no `docs/scripts/reflect.sh`
or evolution controls, and this job forbids an evolution cycle. No new ADR,
memory file, experiment, or owner decision was introduced.

## Scoped Rollback

Trigger rollback for any landmark, content, or navigation regression, or any
existing check failure. Revert only this job's commit:
`git revert <job-commit>`. Never reset the branch or revert unrelated work.

Repeat `npm run lint && npm run typecheck && npm run build` and the same
ten-page baseline comparison against the worker starting commit. Repeat any
available browser checks. After rollback, expect the original zero-main
defect with otherwise restored content and navigation, including the existing
768px scroll-lock repair and labeled product home link.
