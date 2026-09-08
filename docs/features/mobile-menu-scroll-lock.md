# Feature: Mobile Menu Scroll Lock

**ID:** FEAT-002
**Date:** 2026-09-08
**Status:** Implemented (human review pending)
**Owner:** Lamplit Labs
**Lifecycle tier:** Tier 0 (existing-behavior repair)

## Existing Behavior and Scope

Worker starting commit: `99f9c01819c64669c9957f98e8443753c68a6643`.

`app/page.tsx` locks body scrolling while `mobileMenuOpen` is true and clears
the lock when the menu closes or the effect cleans up. The header hides its
mobile navigation at Tailwind's existing `md` breakpoint (768px). Crossing that
breakpoint with an open menu hides the navigation without closing its state,
leaving desktop scrolling locked.

Repair only this missing breakpoint transition in `app/page.tsx`: entering
desktop layout must close a stale mobile menu and let the existing effect
release its scroll lock. This restores the shipped responsive navigation;
it introduces no new feature or surface and needs no ADR or separate plan.

Preserve mobile toggling, menu-link callbacks, desktop navigation, styling,
breakpoints, theme handling, and effect cleanup. Do not change the header,
dependencies, configuration, analytics, privacy, deployment, or protected
documents. Escape handling, focus management, disclosure semantics, and
redesign are out of scope.

## Acceptance Sequence

1. At 375px with the menu closed, body overflow is unlocked.
2. Open the menu at 375px; body overflow becomes `hidden`.
3. Resize to 1024px; the menu state closes and body overflow clears.
4. Return to 375px; the menu stays closed and scrolling stays unlocked.
5. Reopen, then follow a mobile menu link; the existing callback closes the
   menu and clears the lock. Ordinary button open/close also remains intact.
6. At 767px the menu can remain open; crossing to exactly 768px closes it.
7. Unmount with the menu open; body overflow clears and all effect listeners
   are removed. Remount with no duplicate listeners or inherited lock, and
   repeat the desktop transition. Effect cleanup/setup replay is also safe.

## Implementation and Verification

Use a media-query change listener matching the existing desktop breakpoint.
Close mobile state only when the query matches, and unregister the same
listener on cleanup. Keep the existing scroll-lock effect responsible for
clearing body overflow.

Run an in-memory harness using the installed React, TypeScript, and Node
assertions; do not install browser or test packages. Execute the
actual Home effects and Header button/link callbacks with simulated viewport,
DOM, and effect lifecycles. Compare the starting revision with the repair,
including the acceptance sequence above. This is effect-level evidence, not a
rendered-browser or visual test.

Record reproduction evidence separately from the required repository checks:

```bash
npm run lint && npm run typecheck && npm run build
```

### Reproduction Evidence (2026-09-08)

The same harness executed the starting revision from `git show` and the
repaired working copy, using Node v22.18.0, React 19.2.8, and TypeScript 5.9.3.
It transpiled the actual Home and Header modules, used React elements and a
controlled hook dispatcher, and asserted state, body overflow, React element
presence, callbacks, and listener identity. Unrelated child components
were stubbed. Tailwind's resolved configuration confirmed `md = 768px`.

| Sequence | Starting revision | Repaired |
|----------|-------------------|----------|
| Closed at 375px | Closed, unlocked | Closed, unlocked |
| Open at 375px | Open, `hidden` | Open, `hidden` |
| Resize to 1024px | Still open, `hidden` (defect) | Closed, unlocked |
| Return to 375px | Still open, `hidden` (stale) | Closed, unlocked |
| Reopen and follow each of all four menu links | Closed, unlocked | Closed, unlocked |
| Ordinary button close | Closed, unlocked | Closed, unlocked |
| Open at 767px, then resize to 768px | Still open, `hidden` (defect) | Closed, unlocked |
| Unmount while open | Unlocked; no listeners | Unlocked; no listeners |
| Remount and cleanup/setup replay | No leaked lock or listeners | No leaked lock or listeners |
| Mount at 1024px, then return to 375px | Closed, unlocked | Closed, unlocked |

For baseline link cases, the stale menu was first closed before reopening.
The repaired effect kept exactly one breakpoint listener while mounted and
zero after cleanup; every added listener was removed by identity. Remount and
effect replay preserved the successful desktop transition. Existing scroll
listener and intersection-observer cleanup, desktop links, external-link
attributes, and theme props also remained intact.

### Repository Checks (2026-09-08)

`npm run lint && npm run typecheck && npm run build` exited successfully:
no ESLint warnings/errors, no TypeScript errors, and all 13 static pages
generated. These checks are separate from the effect-level reproduction
evidence above; no rendered-browser result is claimed.

## Scoped Rollback

If navigation, scrolling, cleanup, or the existing checks regress, revert only
this job's commit with `git revert <job-commit>`. Do not reset the checkout or
revert unrelated work. The recorded starting commit identifies the original
behavior for comparison.

Repeat the same effect-harness sequence (expecting the documented baseline
resize defect after rollback), then repeat
`npm run lint && npm run typecheck && npm run build`.
