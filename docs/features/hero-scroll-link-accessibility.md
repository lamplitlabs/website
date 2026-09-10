# Feature: Hero Scroll Link Accessibility

**Date:** 2026-09-09
**Status:** Verified in worker; awaiting human review and merge
**Owner:** Lamplit Labs
**Tier:** 0 - accessible-name repair of an existing icon-only link
**Worker starting commit:** `e757e942e45fa46d2c024c706d66701da31fcfe2`
**Job:** `job-20260909T061008Z-c21e2f` (harbor)

## Baseline and Repair

Before product edits, installed TypeScript and React/React DOM rendered the
actual [`HeroSection`](../../components/home/hero-section.tsx), including its
real child components without mocks. The bottom animated wrapper contains
exactly one arrow anchor with `href="#our-story"` and only the existing
`ArrowDown` SVG. It has no `aria-label`, `aria-labelledby`, `title`, descendant
text, or SVG title: **0/1 named arrow links**. The worker starting commit
matches the lead baseline `e757e94`.

Rendering the actual
[`WhyLamplitSection`](../../components/home/why-lamplit-section.tsx) confirmed
exactly one `<section id="our-story">`. The homepage already includes both
components.

Add only `aria-label="Read our story"` to the existing bottom arrow anchor.
The name is a literal native anchor attribute, independent of viewport,
theme, hover, and hydration. This repair introduces no interaction or
navigation behavior and needs no new ADR or separate plan.

Preserve the anchor's fragment destination, SVG, classes, animated wrapper,
native keyboard/link behavior, and every other hero link and visible word.
Do not modify the upper text-bearing `Our story` CTA, add an `onClick`
handler, or alter scrolling, focus, layout, styles, catalog, or metadata.
The independently queued paragraph-copy correction owns its separate hunk;
this job must preserve the starting revision's paragraph without editing it.

Only the hero attribute and this feature note may change. Dependencies,
lockfiles, configuration, deployment, analytics, consent, privacy, `.github/`,
decisions, and protected evolution paths are out of scope. This is a
human-reviewed Tier 0 repair, not an evolution experiment; do not push,
publish, or merge.

## Acceptance Criteria

- [x] The real `HeroSection` render changes from **0/1 to 1/1 named arrow
  links**, with exactly `aria-label="Read our story"` and `href="#our-story"`.
- [x] The icon and animated wrapper remain identical. Removing only the
  added attribute restores the complete hero markup and component source
  byte-for-byte to the worker starting baseline.
- [x] Every other hero link, including the `Explore products` and upper
  `Our story` text CTAs, retains its exact baseline markup and destination.
  All visible copy remains unchanged.
- [x] The real story-section render and its source remain unchanged, with
  exactly one `section` whose `id` is `our-story`.
- [x] `npm run lint && npm run typecheck && npm run build` succeeds using
  installed packages only.
- [x] The actual `out/index.html` contains exactly one arrow link named
  `Read our story` targeting `#our-story`, the unchanged text CTAs, and the
  existing story target. Naming is present in static HTML before hydration.
- [x] Only the component's one attribute and this feature note enter the
  job commit.

## Verification Method

Capture the untouched starting source, actual `renderToStaticMarkup` and
`renderToString` hero output, and real story-section output outside the
repository before editing. Use installed TypeScript to transpile the actual
modules in memory, installed React server rendering, and Node assertions;
do not install a testing tool or stub any component.

After the repair, count and inspect the arrow link, compare its exact name,
destination, and SVG, and remove only the new attribute to compare the
complete source and both hero renders with their recorded baselines. Check
the unchanged story section and every original hero link. After the project
checks, inspect the actual homepage export and compare its hero with the
real hydratable render and starting baseline.

These are actual component/server-render and static-export assertions, not
browser accessibility-tree, screen-reader, hover, or deployment claims.

## Worker Evidence (2026-09-09)

The baseline, repair, acceptance criteria, and commit-revert rollback were
documented before the product edit. The actual component renders confirmed
**0/1 -> 1/1 named arrow links**, with the exact name `Read our story` and
the original `href="#our-story"`. Removing only the added attribute restored
the complete component source and both baseline hero renders byte-for-byte.
The SVG, animated wrapper, all other links, both text CTAs, and all visible
content were unchanged. The real story-section render and its source also
remained identical, with exactly one story target.

The actual `out/index.html` contained exactly one ArrowDown link with the
expected name and destination and exactly one `section id="our-story"`.
Its complete hero markup matched the real hydratable component render;
removing only the label restored the starting-revision render byte-for-byte,
including every original CTA. The literal label is already present before
hydration and does not depend on viewport, theme, or hover.

`npm run lint && npm run typecheck && npm run build` passed: no ESLint
warnings or errors, no TypeScript errors, and all 13 static pages generated.
The assertions used installed Node 22.18.0, TypeScript 5.9.3, and React/React
DOM 19.2.8. No packages or tools were installed.

Source and scope review found no remaining correctness or lifecycle issue:
the only product change is the single anchor attribute, and this note is the
only other changed repository file. No rollback was triggered.

## Scoped Rollback

If accessible naming, navigation, preserved markup, or project checks
regress, revert only this job's commit with `git revert <job-commit>`.
Use the worker starting commit above as the reference. Never reset the
branch, revert another job, or overwrite the separate paragraph-copy hunk.

Rerun `npm run lint && npm run typecheck && npm run build` and the same real
component, source, CTA, icon, target-section, and static-export comparisons
against the recorded worker starting commit. After rollback, expect the
original **0/1 named arrow links** and otherwise identical baseline markup
and navigation. Restoring the documented defect proves rollback, not a
successful accessibility repair.
