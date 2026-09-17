# Feature: Product Home Link Accessibility

**Date:** 2026-09-08
**Status:** Merged (landed to main)
**Owner:** Lamplit Labs
**Tier:** 0 - existing-link accessibility markup repair
**Worker starting commit:** `c246a1b59adc8a162f894d94006038c3837a8589`
**Job:** `job-20260908T134123Z-05aa03`

## Defect and Markup-Only Scope

At the reported baseline `99f9c01819c64669c9957f98e8443753c68a6643`
and the worker starting commit, the first `Link` in the sticky navigation of
[`app/products/[slug]/page.tsx`](../../app/products/[slug]/page.tsx) points to
`/`. Its two SVG icons have no accessible names, and its only text,
`Lamplit Labs`, is inside a `hidden sm:inline` span. Below Tailwind's default
`sm` breakpoint (640px), the hidden text cannot name the link. All nine catalog
products use this template.

Add only `aria-label="Back to Lamplit Labs home"` to that existing home link.
The explicit name must remain available independently of the responsive text.
Preserve its `href`, icons, visible text, responsive classes, keyboard/link
semantics, and layout. Do not change the shared `Logo`, other links, routing,
navigation interactions, outbound tracking, metadata, analytics, privacy,
dependencies, lockfiles, deployment, `.github/`, or protected documentation.
This is an ordinary human-reviewed repair, not an evolution experiment; no
ADR or separate plan is needed.

## Acceptance Criteria

- [x] The existing nav home link has exactly the explicit accessible name
  `Back to Lamplit Labs home` at every viewport width.
- [x] Its source differs from the worker starting commit only by the added
  `aria-label`; its `href="/"`, two icons, `hidden sm:inline` text, classes,
  native link semantics, and surrounding markup remain unchanged.
- [x] `npm run lint && npm run typecheck && npm run build` succeeds with
  installed dependencies only.
- [x] All nine `out/products/*.html` pages contain the intended nonempty
  `aria-label` on the nav home anchor, independently of the hidden span, and
  retain `href="/"`. Removing only the added attribute leaves each generated
  nav anchor identical to its starting-revision export.
- [x] If existing browser/accessibility tooling is usable, confirm the name
  at 375px and a desktop width, with the text hidden and visible respectively.
  Do not install tools or packages; report unavailable browser evidence
  explicitly rather than claiming a rendered result.
- [x] Only the product route and this feature note are included in the job
  commit.

## Verification

Capture the generated nav home anchors from a starting-revision build before
editing product code. After the required repository checks, inspect the actual
HTML for the nine catalog slugs and compare each anchor with that baseline,
allowing only the explicit label. Check source scope against the recorded
worker starting commit as well. Static markup establishes that the label is
not conditional on the hidden span; a browser/accessibility check, when
available, additionally exercises the rendered responsive states.

### Worker Evidence (2026-09-08)

This note's defect, scope, acceptance criteria, and rollback were recorded
before the product edit. A starting-revision static build captured all nine
navs with their original unnamed SVGs and responsive-only link text.

`npm run lint && npm run typecheck && npm run build` passed with the installed
dependencies: no ESLint warnings/errors, no TypeScript errors, and all 13
static pages generated. No packages or tools were installed.

**Output assertion: 9/9 product pages passed.** The generated home anchor in
each of `amistio`, `azure-compliance-matrix`, `azure-drawio-assets`,
`developer-tools`, `edmx-tools`, `fachsprachprufung`, `kenntnistrainer`,
`leben-in-deutschland`, and `resume-builder` has exactly
`aria-label="Back to Lamplit Labs home"` and `href="/"`. No competing
`aria-labelledby`, hidden state, or replacement role is present on the anchor.
Removing only the new attribute leaves the entire nav byte-for-byte identical
to its own baseline export, including both SVGs, the responsive text, classes,
and outbound link.

An exact source comparison confirmed that the route changed by only the
single label attribute; the shared logo, catalog, and Tailwind configuration
are unchanged. Inspection with the already-installed PostCSS parser confirmed
that the exported `.hidden` rule uses `display:none` and `sm:inline` applies
`display:inline` from 640px. The anchor's unconditional label does not depend
on either text-visibility state.

**Rendered-browser evidence unavailable:** Safari and Safari WebDriver are
installed, but the execution harness denied the WebDriver command. No
Playwright, Puppeteer, or DOM accessibility packages are installed in the
project. The permission boundary was not bypassed and no tools were installed;
no rendered 375px or desktop accessibility result is claimed. The 9/9 result
above is actual static-export evidence, not a browser or deployment claim.

## Scoped Rollback

If accessible naming, markup/layout, navigation, or any existing check
regresses, revert only this job's commit with `git revert <job-commit>`.
Use the worker starting commit above as the reference; do not reset the branch
or revert unrelated work.

Repeat `npm run lint && npm run typecheck && npm run build`, the nine-page
export comparison, and the same available browser checks. After rollback,
expect the original unnamed mobile link and otherwise restored baseline
markup/navigation; do not mistake restoration of the documented defect for a
successful accessibility repair.
