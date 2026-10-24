# Work Plan: Clear remaining 9 production audit advisories (Tier 2 lockfile bumps)

**Date:** 2026-10-21
**Goal:** `npm audit --omit=dev` reports 0 vulnerabilities
**Owner:** owner decision required (Tier 2: lockfile change)
**Estimated Duration:** one focused job per dependency cluster (2 clusters)

## Objective

`tools/audit-watch.sh` (SCHED-014) alerted at 2026-10-21T08:47:07Z: 9 production
vulnerabilities (6 high, 3 moderate) across 5 advisory ids. Every remaining finding
needs a lockfile change that Tier 1 agents may not make, and each cluster is a
dependency-tier decision the owner must accept. This plan records the audit facts so
the next Tier 2 job can act without re-running the audit, per the established pattern
(`docs/plans/2026-10-14-next-15-5-27-security-bump.md`, which the 15.5.28 bump in
commit `4035a55` followed and partially executed).

## Current audit facts (2026-10-21, `npm audit --omit=dev --json`, lockfile at HEAD)

| Advisory | Title | Package(s) affected | Installed | Fixed by | Direct fix? |
|---|---|---|---|---|---|
| GHSA-68fv-2mgg-jv7q | source-map-js: event-loop DoS via indexed source-map section offsets | `source-map-js` (direct prod dep), reached via `next` (patched at 15.5.28 but floor unsatisfied) | 1.2.1 | >= 1.2.2 (patch) | `fixAvailable: true` for `source-map-js`; bumping the direct dep floor to ^1.2.2 clears the `next` chain too |
| GHSA-rj75-hqrm-r3gf | PostCSS: quadratic complexity in flat selector parsing (CPU exhaustion) | `postcss-selector-parser` 6.1.3 → `postcss-nested`, `tailwindcss`, `tailwindcss-animate` | 6.1.3 | >= 7.1.6 (**semver-major** 6.x → 7.x) | **Not resolvable in the current tree:** the installed `postcss-nested@6.2.0` pins `postcss-selector-parser: ^6.1.1` (verified in `package-lock.json`), so a plain lockfile refresh keeps 6.1.3. Clearing this needs a `postcss-nested` major bump to a release depending on `^7.1.6` — which is also why npm reports `fixAvailable: true` for `postcss-nested` as semver-major — plus a tailwindcss-cluster compatibility check. |
| GHSA-vfj7-8cjw-p6xm | braces: stack-exhaustion DoS via deeply nested patterns | `braces` <= 3.0.3 → `micromatch` → `chokidar`, `fast-glob` → `tailwindcss` | 3.0.3 | no upstream fix released yet (`fixedIn: -`, `fixAvailable: false` everywhere on this chain) | none — no lockfile change helps until a fixed `braces` ships |

Advisory set cleared since the last plan (by commit `4035a55`, next 15.5.28):
`next` GHSA-4jqv-mc3x-m676, `next` GHSA-mcj8-r9mp-w47p, `sharp` GHSA-wq5f-xc86-pv6w.

### Update 2026-10-24 (watcher alert 2026-10-24T08:47:14Z)

- `npm audit --omit=dev` now reports **5 vulnerabilities (1 high, 4 moderate)**, down
  from 9: GHSA-vfj7-8cjw-p6xm (`braces`) is **cleared** — the existing
  `brace-expansion` overrides (`^1.1.18` / `^5.0.9`) resolve outside the advisory
  ranges, so `braces@3.0.3` no longer flags. Phase 3 is obsolete.
- Remaining: `source-map-js@1.2.1` high (GHSA-68fv-2mgg-jv7q — Phase 1; advisory range
  `>=1.0.0 <1.2.2`, fixed at `1.2.2`) and the `postcss-selector-parser@6.1.3` moderate
  chain (GHSA-rj75-hqrm-r3gf — Phase 2). Note: the existing override pins
  `postcss-selector-parser` at `6.1.3`, which is **inside** the advisory range
  `<7.1.6`; the fix needs `>=7.1.6`, which `postcss-nested@6.2.0` cannot accept
  (`^6.1.1`), so Phase 2's `postcss-nested` major bump (or a tailwindcss 4 migration)
  is still the only path.

## Success Criteria

- [ ] `npm audit --omit=dev` exits clean (0 vulnerabilities). As of 2026-10-24 the
      `braces` chain (GHSA-vfj7-8cjw-p6xm) is already gone; the remaining work is Phase 1
      (source-map-js patch) and Phase 2 (postcss-selector-parser major chain).
- [ ] `npm run check` (lint → typecheck → build+test) green after each bump.
- [ ] `tailwind.config.ts` / PostCSS pipeline still compiles the full utility set used by
      `app/` and `components/` (visual smoke via `npm run dev` or the `out/` export).

## Tasks

### Phase 1: source-map-js patch bump (low risk)

- [ ] Task 1.1 — Bump `source-map-js` floor in `package.json` to `^1.2.2` and refresh the
      lockfile; confirm installed version >= 1.2.2.
- [ ] Task 1.2 — `npm run check`; confirm GHSA-68fv-2mgg-jv7q is gone from
      `npm audit --omit=dev` (drops both the `source-map-js` node and the `next` effect).

### Phase 2: postcss-selector-parser 6.x → 7.x (moderate risk, build-time only)

- [ ] Task 2.1 — Bump `postcss-nested` to the release that depends on
      `postcss-selector-parser@^7.1.6` (installed 6.2.0 pins `^6.1.1`), then verify
      `tailwindcss@3.4.x` and `tailwindcss-animate@1.0.7` still resolve and compile against
      the 7.x parser; if tailwindcss holds the 6.x line, decide between waiting for upstream
      or a tailwindcss major.
- [ ] Task 2.2 — `npm run check`; spot-check rendered pages for selector regressions
      (nested rules in `app/globals.css` are the blast radius).

### Phase 3: braces GHSA-vfj7-8cjw-p6xm — CLEARED 2026-10-24 (no repo change needed)

- [x] Task 3.1 — Resolved without a repo change: the `brace-expansion` overrides from
      `2de8274` (`^1.1.18` / `^5.0.9`) resolve outside the brace-expansion advisory ranges,
      so `braces@3.0.3` no longer flags. `npm audit --omit=dev` no longer lists the
      `braces`/`chokidar`/`micromatch`/`typescript-eslint` nodes. Nothing to do; the
      original note ("no fixed `braces` release exists, re-check on each watcher alert")
      is superseded.

## Verification Steps

1. **Audit:** `npm audit --omit=dev` — target 0 total (5 remaining as of 2026-10-24:
   `source-map-js` high + the 4-node `postcss-selector-parser` moderate chain; the
   `braces` chain is already gone — see Phase 3).
2. **Checks:** `npm run check` (builds the static export, so `tests/routes.test.mjs`
   out/-tests run too).
3. **Watcher:** `AUDIT_WATCH_FORCE=1 tools/audit-watch.sh` prints the reduced advisory set.

## Rollback Plan (REQUIRED)

**Baseline:** `package.json` and `package-lock.json` at the commit before each phase.

**Trigger:** `npm run check` failure, audit count not reduced, or visual/selector regression.

**Reversal Steps:**
1. `git checkout -- package.json package-lock.json && npm ci`
2. Re-run `npm run check` to confirm the baseline is green.

**Recovery Checks:**
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] `npm audit --omit=dev` returns to the documented pre-change count

## Dependencies

- [ ] Owner approval for the lockfile changes (Tier 2 gate; rule: agents never change the lockfile).
- [ ] Phase 2 depends on a `postcss-nested` major bump (installed 6.2.0 pins
      `postcss-selector-parser: ^6.1.1`) and on `tailwindcss@3.4.x` /
      `tailwindcss-animate@1.0.7` compiling cleanly against parser 7.x.
- [x] ~~Phase 3 depends on an upstream `braces` release~~ — cleared 2026-10-24 by the
      existing `brace-expansion` overrides; see Phase 3.

## Related Artifacts

- Prior plan: `docs/plans/2026-10-14-next-15-5-27-security-bump.md`
- Prior execution: commit `4035a55` (next + eslint-config-next 15.5.25 → 15.5.28)
- Watcher: `tools/audit-watch.sh` (SCHED-014), alert of 2026-10-21T08:47:07Z
