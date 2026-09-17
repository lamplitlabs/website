# Feature: Mobile Menu Expanded State

**Date:** 2026-09-08
**Status:** Merged (landed to main)
**Owner:** Lamplit Labs
**Tier:** 0 - existing-state accessibility markup repair
**Worker starting commit:** `78809858a29b743e2e6cbc435845df469285dd2e`
**Job:** `job-20260908T194946Z-63c590`

## Baseline and Scope

The existing mobile toggle in
[`components/home/header.tsx`](../../components/home/header.tsx) has working
`Open menu` / `Close menu` labels and callbacks, but no `aria-expanded` in
either state. The baseline harness executed the actual Header with both
boolean props before any product edit:

| `mobileMenuOpen` | Accessible label | `aria-expanded` | Toggle callback |
|------------------|------------------|-----------------|-----------------|
| `false` | `Open menu` | Absent | Sets `true` |
| `true` | `Close menu` | Absent | Sets `false` |

All four mobile links (Products, About, Blog, Contact) already call the setter
with `false`. The mobile nav is absent when closed and present when open.
Accurately exposed states: **0/2**, with a repair target of **2/2**.

Add only `aria-expanded={mobileMenuOpen}` to the existing mobile menu button.
Preserve its label, icons, className, onClick callback, conditional mobile nav,
all desktop/mobile links and their target/rel attributes, theme controls,
breakpoints, and link-close callbacks. Leave `app/page.tsx`, including Home's
scroll-lock and desktop-resize effects, unchanged.

Do not add menu/dialog roles, focus or Escape behavior, aria-controls/IDs,
styling, or state refactors. No catalog, dependency/lockfile, configuration,
deployment, tracking, analytics, consent, privacy, `.github/`, decision, or
protected evolution changes are permitted. Only the Header attribute and this
feature note belong in the job commit. This is a human-reviewed Tier 0 repair
of an existing surface, not new interaction behavior, an ADR, or an evolution
experiment; do not publish, push, or merge.

## Acceptance Criteria

- [x] Execute the actual Header with `mobileMenuOpen=false` and `true`; its
  toggle exposes boolean `aria-expanded` values `false` and `true`, respectively.
  React DOM server rendering serializes the corresponding attribute in both
  cases; the open-state result is not inferred from initial HTML or hydration.
- [x] Labels remain `Open menu` / `Close menu`; the button still toggles to the
  opposite boolean, and every one of the four mobile-link callbacks closes it.
- [x] For each same state, removing only the new attribute makes the entire
  rendered Header byte-for-byte identical to the starting revision, including
  real imported children, desktop/mobile links, icons, and theme controls.
- [x] The Header source differs by exactly the one added attribute, with this
  new feature note the only other changed path. Home and its effects stay intact.
- [x] `npm run lint && npm run typecheck && npm run build` succeeds with the
  installed dependencies, without installing tools or packages.
- [x] `out/index.html` contains exactly one mobile toggle, initially labeled
  `Open menu` with `aria-expanded="false"` and no rendered mobile nav.

## Verification Method and Baseline Evidence

This baseline, scope, acceptance, and rollback were documented before editing
product code. A temporary harness outside the clone uses installed Node
v22.18.0, React 19.2.8, React DOM 19.2.8, and TypeScript 5.9.3. It reads the
starting source with `git show` and the working source, transpiles the actual
Header and its local imports in memory, and uses the real installed package
dependencies without component stubs.

Node assertions inspect both React element trees, invoke the actual button
and every mobile-link callback, and compare complete
`react-dom/server` `renderToStaticMarkup` output with a consistent identifier
prefix. The pre-edit run reproduced **0/2** exposed states and confirmed both
labels, both toggle directions, all four link-close callbacks, and unchanged
state-matched markup. Repeat this same exercise after the repair, allowing
only the added attribute, then inspect the exported homepage after the
repository checks.

This is in-memory component/callback and server-rendered/static-export
evidence, not browser, hydration, visual, or assistive-technology testing.

### Repair Evidence (2026-09-08)

| Executed state | Baseline attribute | Repaired attribute | Label and toggle |
|----------------|--------------------|--------------------|------------------|
| Closed (`false`) | Absent | `aria-expanded="false"` | `Open menu`; sets `true` |
| Open (`true`) | Absent | `aria-expanded="true"` | `Close menu`; sets `false` |

The same harness passed before and after the repository checks: accurately
exposed states improved from **0/2 to 2/2**. All four mobile-link close
callbacks still set `false`; desktop links, external target/rel attributes,
both theme-control props, and conditional nav presence remained unchanged.
For each state, stripping only the new attribute left the complete
server-rendered Header byte-for-byte equal to its starting-revision output.
An exact source assertion allowed only the single attribute line, confirmed
Home was unchanged, and restricted changed paths to the Header and this note.

`npm run lint && npm run typecheck && npm run build` succeeded: no ESLint
warnings/errors or TypeScript errors, and all 13 static pages generated.
`git diff --check` passed. The exported `out/index.html` contains one mobile
toggle with `aria-label="Open menu"` and `aria-expanded="false"`; the mobile
nav is not rendered initially. No tools or packages were installed.

## Scoped Rollback

Trigger rollback for a wrong expanded state or accessible name, changed
navigation behavior, or failing existing checks. Revert only this job's
commit with `git revert <job-commit>`; do not reset the checkout or revert
unrelated work.

Repeat the same two-state, label, button-toggle, all-mobile-link callback, and
state-matched markup assertions against the recorded starting commit, then
repeat `npm run lint && npm run typecheck && npm run build` and homepage
inspection. After rollback, expect the original missing attribute (**0/2**),
the original initial HTML, and otherwise identical navigation; restoration
of the baseline defect is not a successful accessibility repair.
