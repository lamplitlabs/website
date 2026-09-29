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
test("static export (out/) has HTML for each route and no dangling local assets", () => {
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
test("static export (out/) home page renders exactly one status badge per product card", () => {
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

// Product-card CTA copy per status. The in-development details link goes to the
// same internal /products/<slug> page as "Learn more", so its label must say it
// leads to progress on an unfinished product rather than sounding like a launch.
test("product card details CTA copy is distinct per status and internal", () => {
  const grid = read("components/product-grid.tsx");
  const cta = grid.match(
    /isInDevelopment \? "([^"]+)" : "([^"]+)"\}\s*<ArrowRight/
  );
  assert.ok(cta, "expected a status-branched details CTA in product-grid.tsx");
  const [, inDevelopment, live] = cta;
  assert.equal(inDevelopment, "See progress");
  assert.equal(live, "Learn more");
  assert.notEqual(inDevelopment, live, "CTA copy must differ per status");
  assert.ok(
    grid.includes(`aria-label={\`\${\n                isInDevelopment ? "${inDevelopment}" : "${live}"\n              }: \${product.name}\`}`),
    "aria-label must reuse the same visible CTA copy"
  );
});

// PDP hero CTA copy per status. The hero button is an outbound link to the
// product's own site, so an in-development product must be labelled the same
// way the card footer and nav/bottom CTAs are: as an unfinished destination,
// not a neutral "Explore" that reads like a launch.
test("product page hero CTA copy is distinct per status and labels in-development destinations", () => {
  const page = read("app/products/[slug]/page.tsx");
  const hero = page.match(
    /trackingContext="product_page_hero_cta"[\s\S]*?\{isInDevelopment\s*\?\s*`([^`]+)`\s*:\s*"([^"]+)"\}/
  );
  assert.ok(hero, "expected a status-branched hero CTA in app/products/[slug]/page.tsx");
  const [, inDevelopment, live] = hero;
  assert.equal(inDevelopment, "Visit ${product.name} (in development)");
  assert.equal(live, "Get started");
  assert.notEqual(inDevelopment, live, "hero CTA copy must differ per status");
});

// Whole-page guard (kestrel-10): while Lamplit Light is In development its
// not-yet-public domain must not appear as an <a href> anywhere on the home
// page - footer, AI section CTAs or any future component. Once Light is Live
// the page must link out to it at least once.
test("static export (out/) home page has zero ai.lamplitlabs.com hrefs while Light is in development", () => {
  const light = siteData.match(/slug:\s*"light"[\s\S]*?status:\s*"([^"]+)"/)?.[1];
  assert.ok(light, "expected a status for the light product");
  const html = readFileSync(resolve(root, "out", "index.html"), "utf8");
  const hrefs = html.match(/href="https:\/\/ai\.lamplitlabs\.com[^"]*"/g) ?? [];
  if (light === "In development") {
    assert.equal(hrefs.length, 0, `home page links to ai.lamplitlabs.com ${hrefs.length} time(s) while Light is in development: ${hrefs.join(", ")}`);
  } else {
    assert.ok(hrefs.length >= 1, "live Light should be linked from the home page");
  }
});

// Footer Products list: an in-development product must not link out to its
// not-yet-public domain from every page; it links to its internal
// /products/<slug> page instead. Guards ai.lamplitlabs.com leaking as a footer
// <a href> while Lamplit Light is In development.
test("static export (out/) footer Products list has no ai.lamplitlabs.com href while Light is in development", () => {
  const light = siteData.match(/slug:\s*"light"[\s\S]*?status:\s*"([^"]+)"/)?.[1];
  assert.ok(light, "expected a status for the light product");
  const html = readFileSync(resolve(root, "out", "index.html"), "utf8");
  const footer = html.slice(html.indexOf("<footer"), html.indexOf("</footer>"));
  assert.ok(footer.includes("Products"), "expected a Products list in the footer");
  const hrefs = footer.match(/href="https:\/\/ai\.lamplitlabs\.com[^"]*"/g) ?? [];
  if (light === "In development") {
    assert.equal(hrefs.length, 0, `footer links to ai.lamplitlabs.com ${hrefs.length} time(s) while Light is in development`);
    assert.ok(footer.includes('href="/products/light"'), "footer should link to the internal /products/light page");
  } else {
    assert.ok(hrefs.length >= 1, "live Light should link out from the footer");
  }
});

// Footer text: beyond <a href>, the footer's domain line ("lamplitlabs.com ·
// ai.lamplitlabs.com") must not advertise the AI domain as plain text while
// Lamplit Light is In development; only the AI section carries that copy then.
test("static export (out/) footer block contains no ai.lamplitlabs.com text while Light is in development", () => {
  const light = siteData.match(/slug:\s*"light"[\s\S]*?status:\s*"([^"]+)"/)?.[1];
  assert.ok(light, "expected a status for the light product");
  const html = readFileSync(resolve(root, "out", "index.html"), "utf8");
  const start = html.indexOf("<footer");
  const end = html.indexOf("</footer>");
  assert.ok(start >= 0 && end > start, "expected a <footer> block in out/index.html");
  const footer = html.slice(start, end);
  const mentions = footer.match(/ai\.lamplitlabs\.com/g) ?? [];
  if (light === "In development") {
    assert.equal(mentions.length, 0, `footer mentions ai.lamplitlabs.com ${mentions.length} time(s) while Light is in development`);
  } else {
    assert.ok(mentions.length >= 1, "live Light should be advertised in the footer domain line");
  }
});

// AI section Explore CTA (delta-15): while Lamplit Light is In development the
// "Explore Lamplit Light" button in the exported #ai section must point at the
// internal /products/light page, not at the not-yet-public ai.lamplitlabs.com.
// Once Light is Live it must link out to https://ai.lamplitlabs.com.
test("static export (out/) AI section Explore CTA links to /products/light while Light is in development", { skip: !existsSync(resolve(root, "out")) && "run `npm run build` first" }, () => {
  const light = siteData.match(/slug:\s*"light"[\s\S]*?status:\s*"([^"]+)"/)?.[1];
  assert.ok(light, "expected a status for the light product");
  const html = readFileSync(resolve(root, "out", "index.html"), "utf8");
  const start = html.indexOf('<section id="ai"');
  const end = html.indexOf("<section", start + 1);
  assert.ok(start >= 0 && end > start, "expected a <section id=\"ai\"> block in out/index.html");
  const section = html.slice(start, end);
  const ctas = [...section.matchAll(/<a\s([^>]*)>(?:(?!<\/a>)[\s\S])*?Explore Lamplit Light/g)];
  assert.equal(ctas.length, 1, `expected exactly one Explore Lamplit Light CTA in the AI section, found ${ctas.length}`);
  const href = ctas[0][1].match(/href="([^"]*)"/)?.[1];
  assert.ok(href, "Explore CTA has no href");
  if (light === "In development") {
    assert.equal(href, "/products/light", `Explore CTA links to ${href} while Light is in development`);
  } else {
    assert.equal(href, "https://ai.lamplitlabs.com", `live Light Explore CTA should link out, got ${href}`);
  }
});

// Product page guard (umber-4): while Lamplit Light is In development its own
// /products/light page must not link out to the not-yet-public
// ai.lamplitlabs.com from any CTA (hero, bottom, nav). Once Light is Live the
// page must link out to it at least once.
test("static export (out/) product page has zero ai.lamplitlabs.com hrefs while Light is in development", () => {
  const light = siteData.match(/slug:\s*"light"[\s\S]*?status:\s*"([^"]+)"/)?.[1];
  assert.ok(light, "expected a status for the light product");
  const html = readFileSync(resolve(root, "out", "products", "light.html"), "utf8");
  const hrefs = html.match(/href="https:\/\/ai\.lamplitlabs\.com[^"]*"/g) ?? [];
  if (light === "In development") {
    assert.equal(hrefs.length, 0, `product page links to ai.lamplitlabs.com ${hrefs.length} time(s) while Light is in development: ${hrefs.join(", ")}`);
  } else {
    assert.ok(hrefs.length >= 1, "live Light should be linked from its product page");
  }
});
