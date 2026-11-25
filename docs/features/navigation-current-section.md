# Feature: Navigation Current Section

**Date:** 2026-09-09
**Status:** Merged (landed to main)
**Delivered:** 2026-09-09 (worker implementation only)
**Owner:** Lamplit Labs
**Tier:** 0 - expose existing visual state through one accessibility attribute
**Worker starting commit:** `aca4781a8b8719d897f96d59baeb47b991ae4741`
**Lead baseline:** `e757e94`
**Job:** `job-20260909T061008Z-8a7dbb`

## Baseline and Scope

The desktop navigation in
[`components/home/header.tsx`](../../components/home/header.tsx) already
computes `isActive` using `` !link.external && link.href === `#${activeSection}` ``.
It applies selected text and underline classes, but does not expose the
selection through `aria-current`. The internal targets in
[`lib/site-data.ts`](../../lib/site-data.ts) are Products (`#products`),
About (`#about`), and Contact (`#contact`); Blog is external.

Before any product edit, the actual Header and its real imported children
were rendered for six `activeSection` values, each with `mobileMenuOpen=false`
and `true`. All 12 cases passed baseline markup and callback comparisons.
Six cases had exactly one visually selected desktop link; all 12 lacked
`aria-current`. Internal targets exposing their existing selected state:
**0/3**, with a repair target of **3/3**.

| `activeSection` | `mobileMenuOpen` | Visual desktop selection | Baseline current marker | Repaired `aria-current="location"` |
|-----------------|------------------|--------------------------|-------------------------|-----------------------------------|
| Empty | `false` | None | None | None |
| Empty | `true` | None | None | None |
| `products` | `false` | `#products` | None | `#products` |
| `products` | `true` | `#products` | None | `#products` |
| `about` | `false` | `#about` | None | `#about` |
| `about` | `true` | `#about` | None | `#about` |
| `contact` | `false` | `#contact` | None | `#contact` |
| `contact` | `true` | `#contact` | None | `#contact` |
| `our-story` | `false` | None | None | None |
| `our-story` | `true` | None | None | None |
| `journey` | `false` | None | None | None |
| `journey` | `true` | None | None | None |

Add only `aria-current={isActive ? "location" : undefined}` to the existing
desktop navigation anchor. `location` exposes the currently styled
same-document section, not a different current page. Omit the attribute on
inactive links. Do not change `isActive`, classes, hrefs, external target/rel,
mobile markup, menu callbacks, theme controls, or any Home effects.

Read and preserve the landed
[mobile expanded-state repair](mobile-menu-expanded-state.md) and
[mobile scroll-lock repair](mobile-menu-scroll-lock.md). In every baseline
case the toggle already exposes the matching boolean `aria-expanded`, retains
its `Open menu` / `Close menu` label, and sets the opposite boolean. Each of
the four links in the open mobile nav still sets the menu state to `false`.
The Header, Home, site data, Logo, and LampToggle sources match the lead
baseline at the worker starting revision.

No page/menu/dialog roles, focus or Escape behavior, IDs, new mobile active
state, navigation behavior, or interaction changes are in scope. No new
dependencies/tools, lockfile, configuration, deployment, analytics, consent,
privacy, `.github/`, decisions, or protected evolution changes are permitted.
The job commit must contain exactly the one Header attribute and this feature
note. It is for human review only: no push, publish, or merge.

## Acceptance Criteria

- [x] Execute all 12 actual Header combinations. In each of the six visually
  active cases, exactly the matching desktop anchor exposes
  `aria-current="location"`; the three internal targets improve from **0/3
  to 3/3** exposed selected states.
- [x] Empty, `our-story`, and `journey` have no current marker. Blog never
  receives one, and no mobile link receives one.
- [x] For every case, removing only the new serialized attribute leaves the
  full rendered Header byte-for-byte equal to the starting revision.
  Header callback definitions, toggle results, all four mobile link-close
  results, and both theme-control props remain unchanged.
- [x] Preserve the mobile toggle's boolean `aria-expanded`, labels, icons,
  conditional nav presence, and all link attributes. Home's active-section,
  breakpoint, scroll-lock, and cleanup effects remain source-identical.
- [x] The source diff contains exactly one added Header attribute and this
  note; `git diff --check` succeeds.
- [x] `npm run lint && npm run typecheck && npm run build` succeeds using
  installed dependencies, with no package or tool installation.
- [x] Inspect `out/index.html`: desktop navigation and link attributes match
  the starting revision; there is exactly one mobile menu toggle, initially
  labeled `Open menu` with `aria-expanded="false"`, no mobile nav, and no
  initial current marker. Initial HTML is not evidence for scrolled states.

## Verification Method

This scope, baseline evidence, acceptance, and rollback were recorded before
the product edit. A temporary harness outside the clone uses installed Node
v22.18.0, React 19.2.8, React DOM 19.2.8, and TypeScript 5.9.3. It reads the
starting source with `git show`, transpiles the actual Header and local
imports in memory, and uses installed dependencies without component stubs.
Execution was unsandboxed in the worker clone; no packages or tools were
installed.

The matrix supplies the six section values above and both mobile states,
with `theme="light"` and `scrolled` false for the empty section, true
otherwise. It inspects React elements, invokes the actual toggle and mobile
link callbacks, compares callback definitions and forwarded theme props, and
uses `react-dom/server` `renderToStaticMarkup` with a fixed identifier prefix
to compare the complete Header for each same-state pair.

Visual selection is measured by exact whitespace-separated class tokens:
`text-foreground`, `after:left-1`, and `after:w-[calc(100%-8px)]`. Substring
matching is invalid because inactive links contain the hover token
`hover:after:w-[calc(100%-8px)]`. Both element props and serialized HTML are
checked for marker count and value. An exact source assertion permits only
the requested attribute line and restricts changed paths to the two in scope.

These are component/callback, server-rendered, and static-export observations,
not browser, hydration, visual, or assistive-technology testing.

### Repair Evidence (2026-09-09)

The matrix passed both before and after the repository checks. All six
visually selected cases now expose exactly the matching desktop
`aria-current="location"`; the other six cases have no marker. Blog and all
mobile links remain unmarked. Exposed internal targets improved from
**0/3 to 3/3**.

In all 12 cases, stripping only ` aria-current="location"` left the complete
rendered Header byte-for-byte identical to the starting revision. Callback
definitions and results, theme props, menu labels, both expanded states,
icons, conditional nav presence, and external attributes were preserved.
Exact source comparisons confirmed the single Header attribute, unchanged
Home and imported components/data, and the two-file change boundary.

`npm run lint && npm run typecheck && npm run build` completed successfully:
no ESLint warnings/errors or TypeScript errors, and all 13 static pages were
generated. `git diff --check` passed. In `out/index.html`, the desktop nav and
mobile toggle match the baseline components' rendered markup exactly;
brand and navigation anchor attributes also match. There is one `Open menu`
toggle with `aria-expanded="false"`, no mobile nav, and no initial current
marker. The 12-case matrix, not initial HTML, proves the selected states.

## Scoped Rollback

Trigger rollback if current-state semantics, existing navigation/mobile/theme
behavior, or project checks regress. Revert only this job commit with
`git revert <job-commit>`; do not reset the checkout or revert unrelated work.

Repeat the same 12-case matrix and callback/markup comparisons against worker
starting commit `aca4781a8b8719d897f96d59baeb47b991ae4741`, then repeat
`npm run lint && npm run typecheck && npm run build` and exported-homepage
inspection. A rollback must restore the original missing current marker
(**0/3** exposed internal targets) while retaining the already-landed mobile
expanded state and breakpoint/scroll-lock repairs. Restoring that baseline
defect is recovery, not successful delivery of this repair.
