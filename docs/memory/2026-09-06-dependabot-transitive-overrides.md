# Memory: Clearing Dependabot alerts on pinned transitive dependencies

**Date:** 2026-09-06  
**Type:** Lesson  
**Scope:** Dependencies (`package.json`, `tools/vercel-cli/package.json`, Dependabot)

## Summary

Most Dependabot alerts here sit on transitive packages that `next` or `vercel` pin exactly, so bumping the direct dependency is not enough: add a targeted npm `overrides` entry, then confirm with `npm audit` and the lockfile that no vulnerable version remains.

## Context

The 2026-09-06 sweep closed 86 open alerts (39 on the root lockfile, 47 on `tools/vercel-cli/package-lock.json`). Only a handful were on packages we declare directly. The rest came from three shapes of problem:

1. **The direct dependency itself was vulnerable in every version of its major.** All Next.js 14.x releases were affected (first patched release 15.5.21), so the site had to move to Next 15 / React 19.
2. **The direct dependency pins an exact vulnerable transitive.** `next` pins `postcss@8.4.31`; `vercel` and `@vercel/node` pin `undici@5.x`, and undici 5 never received patches for several 2025–2026 advisories (fixes start at 6.24.0 / 6.27.0 / 6.28.0).
3. **Several majors of one package are in the tree.** `minimatch@3` and `minimatch@10`, `path-to-regexp@6` and `@8`, `undici@6` and `@7` all had to be pinned separately without collapsing one major into another.

## Details

- Prefer the real upgrade first (`next`, `vercel`, `react`), then add `overrides` only for what the upgrade leaves behind. Both manifests keep a short, commented-by-shape list; do not override everything.
- Scope overrides to a major when more than one is installed, e.g. `"undici@<7": "^6.28.0"` and `"undici@>=7 <8": "^7.29.0"`. An unscoped override would force one major onto consumers that declared another and can break them at runtime.
- Nested overrides express "only inside this parent": `"minimatch@3": { "brace-expansion": "^1.1.18" }` patches the copy used by `minimatch@3` without touching the `brace-expansion@5` that `minimatch@10` needs.
- Forcing a major bump on a transitive (undici 5 → 6 inside the Vercel CLI) is a runtime risk. Smoke-test the code path that uses it: `vercel pull --yes --environment=production --token=invalid` and `vercel deploy --prebuilt --prod --token=invalid` must fail with Vercel's "token is not valid" error, not a `TypeError`/crash.
- Dependabot only reads the alerts it opened; `npm audit` can list extra findings (here `browserslist <=4.28.6`). Fix those too while the lockfile is open (`npm audit fix`), then re-run lint, typecheck and build.
- Verify the result from the lockfile, not just `npm audit`: check every `"node_modules/<pkg>"` entry for the package, and that each consumer's declared range still admits the installed version.
- Next 14 → 15 needs code changes even for a static export: `params` becomes a `Promise` in pages and `generateMetadata`, and `next lint` now rejects `<a href="/">` for internal links (`@next/next/no-html-link-for-pages`) — use `next/link`.
- After any dependency change that touches `next` or `vercel`, re-run the `vercel build` check from `2026-09-06-vercel-static-export-root-route.md`; the `/` → `/index` rewrite must still appear right after `{ "handle": "filesystem" }`.

## Examples

```jsonc
// Good ✓ — scoped, one override per installed major (tools/vercel-cli/package.json)
"overrides": {
  "undici@<7": "^6.28.0",
  "undici@>=7 <8": "^7.29.0",
  "minimatch@>=10 <11": "^10.2.3"
}

// Avoid ✗ — unscoped; forces undici 7 onto vercel (declares 5.x) and breaks its API client
"overrides": { "undici": "^7.29.0" }
```

## Related Patterns

- `docs/memory/2026-09-06-vercel-static-export-root-route.md` (post-upgrade routing check)
- `docs/context/stack.md` → versions table
- `.github/workflows/deploy-web-vercel.yml` (consumer of `tools/vercel-cli`)

## Impact

- Anyone bumping `next`, `react`, or `vercel` must re-check the `overrides` blocks: an override that is older than what the parent now pins is harmless, but one that is *newer* than what the parent supports needs the smoke test above.
- Dependabot PRs for a single transitive package will not be able to fix alerts blocked by an exact pin; expect to handle those by hand with `overrides` as described here.
