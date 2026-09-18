// Route/asset smoke test (no extra dependencies).
// Catches the UX regressions static checks miss: a product route missing from
// the sitemap, a cover or icon that points at a file not in public/, and -
// when `npm run build` has produced out/ - a route with no exported HTML or an
// HTML page referencing a local asset that does not exist.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "..", "..");
const read = (p) => readFileSync(resolve(root, p), "utf8");

const siteData = read("lib/site-data.ts");
const slugs = [...siteData.matchAll(/^\s*slug:\s*"([^"]+)"/gm)].map((m) => m[1]);
const covers = [...siteData.matchAll(/^\s*cover:\s*"([^"]+)"/gm)].map((m) => m[1]);
const routes = ["/", ...slugs.map((s) => `/products/${s}`)];

test("site data defines products with unique slugs", () => {
  assert.ok(slugs.length > 0, "expected at least one product slug");
  assert.equal(new Set(slugs).size, slugs.length, "duplicate product slug");
});

test("every product cover image exists in public/", () => {
  assert.equal(covers.length, slugs.length, "every product needs a cover");
  for (const cover of covers) {
    assert.ok(cover.startsWith("/"), `cover must be root-relative: ${cover}`);
    assert.ok(existsSync(resolve(root, "public", cover.slice(1))), `missing ${cover}`);
  }
});

test("icons and og image referenced from app/layout.tsx exist in public/", () => {
  const layout = read("app/layout.tsx");
  const refs = [...layout.matchAll(/"(\/[\w./-]+\.(?:png|svg|ico|webmanifest|json))"/g)].map((m) => m[1]);
  assert.ok(refs.length > 0, "expected asset references in layout");
  for (const ref of refs) {
    assert.ok(existsSync(resolve(root, "public", ref.slice(1))), `missing ${ref}`);
  }
});

test("public/sitemap.xml lists exactly the routes the app exports", () => {
  const sitemap = read("public/sitemap.xml");
  const locs = [...sitemap.matchAll(/<loc>https:\/\/www\.lamplitlabs\.com(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(new Set(locs), new Set(routes));
});

test("internal links in app/ and components/ point at known routes", () => {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.tsx?$/.test(name)) files.push(p);
    }
  };
  walk(resolve(root, "app"));
  walk(resolve(root, "components"));
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/href=["'](\/[^"'#?${}]*)["']/g)) {
      const href = m[1].replace(/\/$/, "") || "/";
      assert.ok(routes.includes(href), `${file.slice(root.length + 1)} links to unknown route ${href}`);
    }
  }
});

// Only runs against a real static export; `npm run build` produces out/.
test("static export (out/) has HTML for each route and no dangling local assets", { skip: !existsSync(resolve(root, "out")) && "run `npm run build` first" }, () => {
  const out = resolve(root, "out");
  for (const route of routes) {
    const html = route === "/" ? "index.html" : `${route.slice(1)}.html`;
    const alt = route === "/" ? null : `${route.slice(1)}/index.html`;
    assert.ok(existsSync(join(out, html)) || (alt && existsSync(join(out, alt))), `no exported page for ${route}`);
    const page = readFileSync(existsSync(join(out, html)) ? join(out, html) : join(out, alt), "utf8");
    for (const m of page.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)) {
      const ref = decodeURIComponent(m[1]);
      if (routes.includes(ref.replace(/\/$/, "") || "/")) continue;
      const candidates = [ref.slice(1), `${ref.slice(1)}.html`, `${ref.slice(1)}/index.html`];
      assert.ok(candidates.some((c) => existsSync(join(out, c))), `${route} references missing ${ref}`);
    }
  }
});

// Product grid: every card in the exported home page renders exactly one
// status badge. Guards the user-facing regression where a product ships with
// no status (badge missing) or the badge is rendered twice (duplicate).
test("static export (out/) home page renders exactly one status badge per product card", { skip: !existsSync(resolve(root, "out")) && "run `npm run build` first" }, () => {
  const html = readFileSync(resolve(root, "out", "index.html"), "utf8");
  // Cards are the TiltSurface wrappers carrying the product-grid `card` class.
  const cards = html.split(/(?=<[a-z]+ class="[^"]*\bproduct-grid_card__)/).slice(1);
  assert.equal(cards.length, slugs.length, `expected ${slugs.length} product cards, found ${cards.length}`);
  for (const card of cards) {
    const name = card.match(/product-grid_name__[^"]*"[^>]*>([^<]+)</)?.[1] ?? "(unknown product)";
    const badges = card.match(/class="product-grid_status__[^"]*"/g) ?? [];
    assert.equal(badges.length, 1, `${name} renders ${badges.length} status badges (expected exactly 1)`);
  }
});
