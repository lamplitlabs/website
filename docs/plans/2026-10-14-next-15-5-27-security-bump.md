# Work Plan: Bump `next` / `eslint-config-next` 15.5.25 → 15.5.27 (clears audit advisories)

**Date:** 2026-10-14  
**Goal:** `npm audit` no longer lists `next`; `npm run check` still passes  
**Owner:** repository owner (dependency change is Tier 2 — agents may not edit the lockfile)  
**Estimated Duration:** 15 minutes

## Objective

At HEAD `ab12bbb` the lockfile pins `next@15.5.25`. `npm audit` reports `next` as
**moderate** (range `15.0.0 - 15.5.26`) via:

- GHSA-4jqv-mc3x-m676
- GHSA-mcj8-r9mp-w47p

`npm view next@15.5.27 version` resolves, and `^15.5.25` already admits it, so only the
lockfile needs to move. This serves visitors of lamplitlabs.com by keeping the framework that
renders every page free of known advisories.

Human decision: proposal `20261014T000338Z-daemon` answered YES (result `20261014T032336Z-human`).
Card: `20261013T234919Z-fleet-1011-fsp-1-2`. Worker `umber` stopped job
`job-20261014T000230Z-8cdeb1` because the change needs `npm install`, which Tier 1 runs forbid.

## Success Criteria

- [ ] `package-lock.json` resolves `node_modules/next` and `node_modules/eslint-config-next` to `15.5.27`
- [ ] `npm audit --json` has no `next` entry
- [ ] `npm run check` passes (lint → typecheck → test, which builds the static export)

## Tasks

### Phase 1: Land the bump (owner, by hand)

- [ ] Task 1.1 — On a fresh `main`, with Node 24.x (`engines`):
  ```bash
  npm install next@15.5.27 eslint-config-next@15.5.27 --save-exact=false --no-fund
  ```
  (`^15.5.25` in `package.json` already covers 15.5.27; `package.json` may stay unchanged
  or move to `^15.5.27` — either is fine.)
- [ ] Task 1.2 — `git diff --stat` should touch only `package-lock.json` (and optionally `package.json`).

### Phase 2: Verify and commit

- [ ] Task 2.1 — `npm audit --json | node -e '...'` (see Verification) shows no `next` key.
- [ ] Task 2.2 — `npm run check` passes.
- [ ] Task 2.3 — Commit as `deps: next 15.5.27 (GHSA-4jqv-mc3x-m676, GHSA-mcj8-r9mp-w47p)` and
  answer thread `evolution/job-20261013t234921z-960b5a` naming the commit, or decline the card
  with `--resolution declined`.

## Verification Steps

1. **Audit no longer lists next:**
   ```bash
   npm audit --json | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>process.exit("next" in JSON.parse(d).vulnerabilities ? 1 : 0))'
   ```
2. **Full project check:**
   ```bash
   npm run check
   ```
3. **CI:** `.github/workflows/ci.yml` (lint → typecheck → build) goes green on the branch.

## Rollback Plan (REQUIRED)

`git revert <commit>` restores `package-lock.json` to 15.5.25, then `npm ci`. No data, config or
deploy changes are involved; Vercel redeploys from `main` automatically.

## Out of scope (noted for later cards)

The same audit also lists transitive `high` findings that need **major** bumps and are not
covered by this plan: `tailwindcss` 3.x chain (`braces`, `micromatch`, `fast-glob`, `chokidar`,
`postcss-selector-parser`), `eslint-config-next`'s `@next/eslint-plugin-next` via `fast-glob`,
`sharp <0.35.5`, `source-map-js`, `brace-expansion`. Each needs its own ADR.
