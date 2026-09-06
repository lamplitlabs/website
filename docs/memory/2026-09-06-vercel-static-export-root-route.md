# Memory: Vercel static export needs an explicit `/` route

**Date:** 2026-09-06  
**Type:** Lesson  
**Scope:** Deployment / Vercel routing (`vercel.json`, `.github/workflows/deploy-web-vercel.yml`)

## Summary

The Vercel Next.js builder serves `out/index.html` as `/index` and emits no route for `/`; `vercel.json` must rewrite `/` → `/index` or the homepage returns Vercel's 404 page while every other page works.

## Context

After the 2026-08-27 production deploy, `https://www.lamplitlabs.com/` returned **404** (the apex `lamplitlabs.com` 308-redirects to `www`, so both looked broken). Everything else was healthy:

- `/products/amistio`, `/ads.txt`, `/robots.txt`, `/sitemap.xml`, `/_next/static/*` → 200
- `/index` → 200 and byte-identical to `out/index.html`
- `/index.html`, `/products/amistio.html`, `/` → 404 (Next.js-rendered `404.html`)

That pattern is the fingerprint of `@vercel/next`'s `output: "export"` branch, not a broken build.

## Details

- `vercel build` (used by the deploy workflow with `vercel deploy --prebuilt`) runs `@vercel/next`. When it detects `next export` output it globs `out/**`, **strips the `.html` extension** from every page (`index.html` → `index`, `products/amistio.html` → `products/amistio`) via Build Output API `overrides`, and returns a route list that goes straight to `{ "handle": "filesystem" }` with **no explicit rule for `/`**.
- The homepage therefore depends on Vercel's platform implicitly resolving `/` to the extensionless `index` output. On the live deployment that resolution was not applied, so `/` fell through to the `handle: error` → `/404` route.
- Adding to `vercel.json`:

  ```json
  { "rewrites": [{ "source": "/", "destination": "/index" }] }
  ```

  makes the CLI merge `{ "src": "^/$", "dest": "/index", "check": true }` directly after `handle: filesystem` in `.vercel/output/config.json`. `/` now re-checks the filesystem as `/index`, which is exactly the path that already served the page.
- A `next.config.js` `rewrites()` entry would also reach Vercel via the routes manifest, but `next dev` applies it too and `/index` is not an App Router route, so local dev would 404 at `/`. Keep this in `vercel.json`.
- `trailingSlash: true` is **not** a fix: it turns every page into `dir/index.html` → `dir/index`, so every page would depend on the same implicit index resolution.

### How to verify locally (no Vercel credentials needed)

```bash
mkdir -p .vercel
echo '{"projectId":"stub","orgId":"stub","settings":{"framework":"nextjs"}}' > .vercel/project.json
tools/vercel-cli/node_modules/.bin/vercel build --yes
python3 -c "import json; [print(r) for r in json.load(open('.vercel/output/config.json'))['routes']]"
rm -rf .vercel
```

Expect `{'src': '^/$', 'dest': '/index', 'check': True}` right after `{'handle': 'filesystem'}`.

### How to verify in production

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://www.lamplitlabs.com/          # expect 200
curl -sS -o /dev/null -w "%{http_code}\n" https://www.lamplitlabs.com/index     # expect 200
curl -sS -o /dev/null -w "%{http_code}\n" https://www.lamplitlabs.com/products/amistio  # expect 200
```

## Examples

```json
// Good ✓ — vercel.json
{ "rewrites": [{ "source": "/", "destination": "/index" }] }
```

```js
// Avoid ✗ — next.config.js (breaks `next dev` at "/")
async rewrites() { return [{ source: "/", destination: "/index" }]; }
```

## Related Patterns

- `README.md` → Deployment
- `docs/context/stack.md` → Deployment Target
- `.github/workflows/deploy-web-vercel.yml` (already lists `vercel.json` in its trigger paths)

## Impact

- Anyone touching `vercel.json`, `next.config.js` (`output`, `trailingSlash`), or the deploy workflow must keep the `/` rewrite and re-run the local `vercel build` check above.
- Production smoke test after every deploy: `curl -I https://www.lamplitlabs.com/` must be 200, not just a sub-page.
