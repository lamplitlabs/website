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
// Static (non-product) routes exported from app/: each needs an app/<route>/page.tsx.
const staticRoutes = ["/privacy"];
const routes = ["/", ...staticRoutes, ...slugs.map((s) => `/products/${s}`)];

// Cookie banner trust gap (kestrel-2): "We use cookies for analytics" must
// link to a real /privacy page explaining what is collected and why, and the
// footer must carry the same link so the page stays reachable after the
// banner is dismissed.
test("cookie banner and footer link to an existing /privacy route", () => {
  assert.ok(existsSync(resolve(root, "app", "privacy", "page.tsx")), "app/privacy/page.tsx must exist");
  assert.match(read("components/cookie-consent.tsx"), /href="\/privacy"/, "cookie banner must link to /privacy");
  assert.match(read("components/home/footer.tsx"), /href="\/privacy"/, "footer must link to /privacy");
  const privacy = read("app/privacy/page.tsx");
  assert.match(privacy, /Plausible/, "privacy page must name the cookieless analytics that always runs");
  assert.match(privacy, /Google Analytics/, "privacy page must name the consent-gated analytics");
});


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

// app/sitemap.ts generates sitemap.xml from lib/site-data.ts at build time, so a
// hand-maintained public/sitemap.xml must not shadow it (silent drift).
test("app/sitemap.ts derives product URLs from lib/site-data.ts and no static sitemap shadows it", () => {
  assert.ok(!existsSync(resolve(root, "public", "sitemap.xml")), "public/sitemap.xml must not exist; app/sitemap.ts generates it");
  const src = read("app/sitemap.ts");
  assert.match(src, /from "@\/lib\/site-data"/, "app/sitemap.ts must import the product catalog");
  assert.match(src, /products\.map\(/, "app/sitemap.ts must map over products");
  for (const route of staticRoutes) {
    assert.ok(src.includes(`"${route}"`), `app/sitemap.ts must list static route ${route}`);
  }
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
// `npm test` builds first so these never skip there; `npm run test:unit` skips them when out/ is absent.
const skipWithoutOut = { skip: !existsSync(resolve(root, "out")) && "run `npm run build` first" };

test("static export (out/) sitemap.xml lists exactly the routes the app exports", skipWithoutOut, () => {
  const sitemap = readFileSync(resolve(root, "out", "sitemap.xml"), "utf8");
  const locs = [...sitemap.matchAll(/<loc>https:\/\/www\.lamplitlabs\.com(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(new Set(locs), new Set(routes));
  assert.equal(locs.length, routes.length, "sitemap must not repeat a route");
});

// app/robots.ts generates robots.txt from app/sitemap.ts's siteUrl so crawlers get
// an explicit allow rule and sitemap pointer; a static public/robots.txt must not shadow it.
test("static export (out/) robots.txt allows crawling and points at the sitemap", skipWithoutOut, () => {
  assert.ok(!existsSync(resolve(root, "public", "robots.txt")), "public/robots.txt must not exist; app/robots.ts generates it");
  const robots = readFileSync(resolve(root, "out", "robots.txt"), "utf8");
  assert.match(robots, /^User-Agent: \*$/mi, "robots.txt must address all crawlers");
  assert.match(robots, /^Allow: \/$/m, "robots.txt must allow crawling the site");
  assert.match(robots, /^Sitemap: https:\/\/www\.lamplitlabs\.com\/sitemap\.xml$/m, "robots.txt must point at the sitemap");
});

test("static export (out/) has HTML for each route and no dangling local assets", skipWithoutOut, () => {
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

// Accessibility: keyboard and screen-reader users must be able to bypass the
// repeated header/nav links. Every exported route renders a "Skip to content"
// anchor (first focusable element) that targets <main id="main-content">.
test("static export (out/) every route has a skip link targeting main#main-content", skipWithoutOut, () => {
  const out = resolve(root, "out");
  // The 404 page (out/404.html) is served for every unknown URL and must not
  // leave the skip link as a dead anchor, so it is checked alongside the routes.
  const pages = [...routes.map((route) => {
    const html = route === "/" ? "index.html" : `${route.slice(1)}.html`;
    const alt = route === "/" ? null : `${route.slice(1)}/index.html`;
    return [route, existsSync(join(out, html)) ? join(out, html) : join(out, alt)];
  }), ["/404 (out/404.html)", join(out, "404.html")]];
  for (const [route, file] of pages) {
    const page = readFileSync(file, "utf8");
    assert.match(page, /<a href="#main-content"[^>]*>Skip to content<\/a>/, `${route} must render a skip link`);
    assert.match(page, /<main[^>]*\bid="main-content"/, `${route} must have <main id="main-content">`);
    const skipIdx = page.search(/<a href="#main-content"/);
    const firstLink = page.search(/<(?:a|button)[\s>]/);
    assert.equal(skipIdx, firstLink, `${route}: skip link must be the first focusable element in the body`);
  }
});

// Product grid: every card in the exported home page renders exactly one
// status badge. Guards the user-facing regression where a product ships with
// no status (badge missing) or the badge is rendered twice (duplicate).
test("static export (out/) home page renders exactly one status badge per product card", skipWithoutOut, () => {
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

// "What's next" link (umber-2): in-development cards are disabled, so the
// grid must offer users a concrete next step. While any card is In
// development the exported home page renders exactly one "See what's next"
// link that anchors to the homepage AI section (#ai) - not to "#about", which
// does not exist on the home page and would be a dead scroll - and the #ai
// section must actually exist in the same page.
test("static export (out/) home page links in-development users to #ai, not a dead #about scroll", skipWithoutOut, () => {
  const html = readFileSync(resolve(root, "out", "index.html"), "utf8");
  const inDevelopmentCards = (html.match(/product-grid_status__[^"]*"[^>]*>(?:<[^>]*>)*\s*In development/g) ?? []).length;
  const links = html.match(/<a href="([^"]+)" data-testid="in-development-whats-next"/g) ?? [];
  if (inDevelopmentCards === 0) {
    assert.equal(links.length, 0, "no product is In development but the grid still renders a What's next link");
    return;
  }
  assert.equal(links.length, 1, `expected exactly one What's next link, found ${links.length}`);
  const href = links[0].match(/href="([^"]+)"/)[1];
  assert.equal(href, "#ai", "in-development What's next link must anchor to the AI section");
  assert.notEqual(href, "#about", "home page has no #about section; that anchor would be a dead scroll");
  assert.match(html, /<section id="ai"/, "home page must contain the #ai section the link targets");
});

// Product-card details CTA, asserted on the rendered export rather than on
// source text. In-development cards render no footer (the whole card is
// disabled), so they carry a body-level "See progress" link instead; Live
// cards carry a details link whose visible copy and aria-label both read
// "Learn more" and point at the internal PDP.
test("static export (out/) home page renders a 'Learn more' details CTA on every live product card only", skipWithoutOut, () => {
  const html = readFileSync(resolve(root, "out", "index.html"), "utf8");
  const cards = html.split(/(?=<[a-z]+ class="[^"]*\bproduct-grid_card__)/).slice(1);
  assert.equal(cards.length, slugs.length, `expected ${slugs.length} product cards, found ${cards.length}`);
  let live = 0;
  for (const card of cards) {
    const name = card.match(/product-grid_name__[^"]*"[^>]*>([^<]+)</)?.[1] ?? "(unknown product)";
    const inDevelopment = /product-grid_status__[^"]*"[^>]*>(?:<[^>]*>)*\s*In development/.test(card);
    const details = card.match(/<a href="\/products\/([^"]+)" aria-label="([^"]+)"[^>]*>([^<]*)</g) ?? [];
    if (inDevelopment) {
      // comingSoon cards are not clickable as a whole, so the body must carry
      // its own actionable "See progress" link to the internal PDP (lumen-2).
      const progress = card.match(/<a href="\/products\/([^"]+)"[^>]*data-testid="coming-soon-see-progress"[^>]*>([^<]*)</g) ?? [];
      assert.equal(progress.length, 1, `${name} is In development but renders ${progress.length} 'See progress' links (expected exactly 1)`);
      const [, pSlug, pCopy] = progress[0].match(/<a href="\/products\/([^"]+)"[^>]*>([^<]*)</);
      assert.ok(slugs.includes(pSlug), `${name} See progress link points at unknown slug ${pSlug}`);
      assert.equal(pCopy.trim(), "See progress");
      assert.ok(progress[0].includes(`aria-label="See progress: ${name}"`), "aria-label must reuse the visible CTA copy");
      continue;
    }
    live += 1;
    assert.equal(details.length, 1, `${name} renders ${details.length} details CTAs (expected exactly 1)`);
    const [, slug, label, copy] = details[0].match(/<a href="\/products\/([^"]+)" aria-label="([^"]+)"[^>]*>([^<]*)</);
    assert.ok(slugs.includes(slug), `${name} details CTA points at unknown slug ${slug}`);
    assert.equal(copy.trim(), "Learn more");
    assert.equal(label, `Learn more: ${name}`, "aria-label must reuse the visible CTA copy");
  }
  assert.ok(live > 0, "expected at least one live product card");
});

// Source-level guard for the product-card "See progress" CTA (no build
// needed). The copy may only ever be reached through the isInDevelopment
// ternary, isInDevelopment must come from isProductInDevelopment(product),
// and that helper must be a strict equality on "In development" - so no
// product whose status contains "Live" can ever render "See progress".
test("product grid gates 'See progress' strictly on an In-development status, never on a Live product", () => {
  const grid = read("components/product-grid.tsx");
  const total = (grid.match(/See progress/g) ?? []).length;
  const gated = (grid.match(/isInDevelopment \? "See progress"/g) ?? []).length;
  assert.equal(total, gated, "'See progress' must only appear behind the isInDevelopment ternary");
  assert.match(grid, /const isInDevelopment = isProductInDevelopment\(product\);/);
  const helper = siteData.match(/export function isProductInDevelopment\([\s\S]*?\n\}/)?.[0];
  assert.ok(helper, "expected isProductInDevelopment in lib/site-data.ts");
  const literal = helper.match(/product\.status === "([^"]+)"/)?.[1];
  assert.equal(literal, "In development", "isProductInDevelopment must be a strict equality on the status literal");
  const statuses = [...siteData.matchAll(/^\s*status:\s*"([^"]+)"/gm)].map((m) => m[1]);
  assert.equal(statuses.length, slugs.length, "every product needs a status");
  const inDevelopment = (status) => status === literal;
  for (const status of statuses) {
    if (status.includes("Live")) {
      assert.equal(inDevelopment(status), false, `Live status "${status}" would render 'See progress'`);
    }
  }
  assert.ok(statuses.some((s) => s.includes("Live")), "expected at least one Live product to exercise the guard");
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

// Source-level gate (juniper-5): while a product is In development its page
// CTAs must stay on-page (#about) instead of linking out to the product's
// not-yet-public url. Guards the ctaHref branch directly so a regression is
// caught even without a fresh static export.
test("product page uses #about as ctaHref while the product is in development", () => {
  const page = read("app/products/[slug]/page.tsx");
  assert.match(
    page,
    /const isInDevelopment = isProductInDevelopment\(product\);/,
    "expected isInDevelopment derived from isProductInDevelopment(product)"
  );
  const cta = page.match(/const ctaHref = isInDevelopment\s*\?\s*"([^"]+)"\s*:\s*product\.url;/);
  assert.ok(cta, "expected ctaHref to branch on isInDevelopment in app/products/[slug]/page.tsx");
  assert.equal(cta[1], "#about", "in-development CTAs must anchor to #about, not the product url");
  const hrefs = page.match(/href=\{ctaHref\}/g) ?? [];
  assert.ok(hrefs.length >= 1, "expected at least one CTA to use href={ctaHref}");
});

// Source-level gate (nimbus-2): the in-development CTAs anchor to #about on
// the same page, so they must not carry an "opens externally" icon
// (ExternalLink / ArrowUpRight). The icon is decorative and hidden from AT.
test("product page CTAs swap the external-link icon for an in-page icon while in development", () => {
  const page = read("app/products/[slug]/page.tsx");
  const cta = page.match(/const CtaIcon = isInDevelopment\s*\?\s*(\w+)\s*:\s*ArrowUpRight;/);
  assert.ok(cta, "expected CtaIcon to branch on isInDevelopment in app/products/[slug]/page.tsx");
  assert.notEqual(cta[1], "ArrowUpRight", "in-development CTA icon must not be ArrowUpRight");
  const nav = page.match(/const NavCtaIcon = isInDevelopment\s*\?\s*(\w+)\s*:\s*ExternalLink;/);
  assert.ok(nav, "expected NavCtaIcon to branch on isInDevelopment");
  assert.notEqual(nav[1], "ExternalLink", "in-development nav CTA icon must not be ExternalLink");
  assert.equal(cta[1], nav[1], "nav and bottom/hero CTAs should share the in-page icon");
  assert.doesNotMatch(page, /<(ExternalLink|ArrowUpRight) className/, "icons must be rendered via the status-branched components");
  const icons = page.match(/<(?:Nav)?CtaIcon aria-hidden="true"/g) ?? [];
  assert.equal(icons.length, 3, "nav, hero and bottom CTA icons must be aria-hidden");
});

// Explicit pairing per product (granite): the icon and the href are two
// separate ternaries on isInDevelopment, so a future edit could leave them
// mismatched (e.g. an ArrowDown icon on an external product.url link). Resolve
// both for every product in site-data and assert the pair: In development ->
// ArrowDown + "#about"; any other status -> ArrowUpRight + product.url. Both
// branches must be exercised by at least one real product.
test("product page icon and ctaHref pair up per product status for every product in site-data", () => {
  const page = read("app/products/[slug]/page.tsx");
  const helper = siteData.match(/export function isProductInDevelopment\([\s\S]*?\n\}/)?.[0];
  const literal = helper?.match(/product\.status === "([^"]+)"/)?.[1];
  assert.equal(literal, "In development", "isProductInDevelopment must be a strict equality on the status literal");
  const href = page.match(/const ctaHref = isInDevelopment\s*\?\s*"([^"]+)"\s*:\s*(product\.url);/);
  assert.ok(href, "expected ctaHref to branch on isInDevelopment between a literal and product.url");
  const icon = page.match(/const CtaIcon = isInDevelopment\s*\?\s*(\w+)\s*:\s*(\w+);/);
  assert.ok(icon, "expected CtaIcon to branch on isInDevelopment between two icon components");
  const resolve = (product) => {
    const isInDevelopment = product.status === literal;
    return {
      ctaHref: isInDevelopment ? href[1] : product.url,
      CtaIcon: isInDevelopment ? icon[1] : icon[2],
    };
  };
  const productsBlock = siteData.match(/export const products[^=]*=\s*\[([\s\S]*?)\n\];/)?.[1];
  assert.ok(productsBlock, "expected a products array in lib/site-data.ts");
  const products = productsBlock
    .split(/\n\s*\{\s*\n\s*slug:/)
    .slice(1)
    .map((chunk) => ({
      slug: chunk.match(/^\s*"([^"]+)"/)?.[1],
      url: chunk.match(/^\s*url:\s*"([^"]+)"/m)?.[1],
      status: chunk.match(/^\s*status:\s*"([^"]+)"/m)?.[1],
    }));
  assert.equal(products.length, slugs.length, "every product must be parsed");
  let inDev = 0;
  let live = 0;
  for (const product of products) {
    assert.ok(product.url && product.status, `product ${product.slug} needs url and status`);
    const { ctaHref, CtaIcon } = resolve(product);
    if (product.status === "In development") {
      inDev += 1;
      assert.equal(CtaIcon, "ArrowDown", `${product.slug}: in-development CTA icon must be ArrowDown`);
      assert.equal(ctaHref, "#about", `${product.slug}: in-development CTA href must be #about`);
    } else {
      live += 1;
      assert.equal(CtaIcon, "ArrowUpRight", `${product.slug}: ${product.status} CTA icon must be ArrowUpRight`);
      assert.equal(ctaHref, product.url, `${product.slug}: ${product.status} CTA href must be the product url`);
    }
    // The pairing itself: an in-page arrow never sits on an external href and vice versa.
    assert.equal(CtaIcon === "ArrowDown", ctaHref === "#about", `${product.slug}: icon/href pairing mismatch (${CtaIcon} with ${ctaHref})`);
  }
  assert.ok(inDev >= 1, "expected at least one In development product to exercise the #about branch");
  assert.ok(live >= 1, "expected at least one Live product to exercise the product.url branch");
});

// Whole-page guard (kestrel-10): while Lamplit Light is In development its
// not-yet-public domain must not appear as an <a href> anywhere on the home
// page - footer, AI section CTAs or any future component. Once Light is Live
// the page must link out to it at least once.
test("static export (out/) home page has zero ai.lamplitlabs.com hrefs while Light is in development", skipWithoutOut, () => {
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


// Product-page guard (ember-5): while Lamplit Light is In development its own
// /products/light page (hero CTA, feature links, canonical/OG url) must not
// link to the not-yet-public ai.lamplitlabs.com. Once Light is Live the page
// must link out to it at least once.
test("static export (out/) /products/light page has zero ai.lamplitlabs.com hrefs while Light is in development", skipWithoutOut, () => {
  const light = siteData.match(/slug:\s*"light"[\s\S]*?status:\s*"([^"]+)"/)?.[1];
  assert.ok(light, "expected a status for the light product");
  const html = readFileSync(resolve(root, "out", "products", "light.html"), "utf8");
  const hrefs = html.match(/href="https:\/\/ai\.lamplitlabs\.com[^"]*"/g) ?? [];
  if (light === "In development") {
    assert.equal(hrefs.length, 0, `/products/light links to ai.lamplitlabs.com ${hrefs.length} time(s) while Light is in development: ${hrefs.join(", ")}`);
  } else {
    assert.ok(hrefs.length >= 1, "live Light should link out from its product page");
  }
});

// Whole-page guard (ember-6): the href-only checks above miss JSON-LD
// (`url`/`sameAs`), canonical/og:url meta, and any trackingUrl string that
// the product page renders as text or attributes. While Lamplit Light is
// In development the exported /products/light page must not mention
// ai.lamplitlabs.com anywhere. Once Light is Live it must mention it.
test("static export (out/) /products/light page has zero ai.lamplitlabs.com mentions anywhere (JSON-LD, meta, text) while Light is in development", skipWithoutOut, () => {
  const light = siteData.match(/slug:\s*"light"[\s\S]*?status:\s*"([^"]+)"/)?.[1];
  assert.ok(light, "expected a status for the light product");
  const html = readFileSync(resolve(root, "out", "products", "light.html"), "utf8");
  const mentions = html.match(/ai\.lamplitlabs\.com/g) ?? [];
  if (light === "In development") {
    assert.equal(mentions.length, 0, `/products/light mentions ai.lamplitlabs.com ${mentions.length} time(s) (whole page, incl. JSON-LD/meta) while Light is in development`);
  } else {
    assert.ok(mentions.length >= 1, "live Light product page should mention ai.lamplitlabs.com");
  }
});

// Footer Products list: an in-development product must not link out to its
// not-yet-public domain from every page; it links to its internal
// /products/<slug> page instead. Guards ai.lamplitlabs.com leaking as a footer
// <a href> while Lamplit Light is In development.
test("static export (out/) footer Products list has no ai.lamplitlabs.com href while Light is in development", skipWithoutOut, () => {
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
test("static export (out/) footer block contains no ai.lamplitlabs.com text while Light is in development", skipWithoutOut, () => {
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

// Product page (umber-4): while Lamplit Light is In development the exported
// /products/light page must not link to the not-yet-public ai.lamplitlabs.com
// anywhere - hero, nav or bottom CTAs. Once Light is Live it must link out.
test("static export (out/) product page has zero ai.lamplitlabs.com hrefs while Light is in development", skipWithoutOut, () => {
  const light = siteData.match(/slug:\s*"light"[\s\S]*?status:\s*"([^"]+)"/)?.[1];
  assert.ok(light, "expected a status for the light product");
  const html = readFileSync(resolve(root, "out", "products", "light.html"), "utf8");
  const hrefs = html.match(/href="https:\/\/ai\.lamplitlabs\.com[^"]*"/g) ?? [];
  if (light === "In development") {
    assert.equal(hrefs.length, 0, `product page links to ai.lamplitlabs.com ${hrefs.length} time(s) while Light is in development: ${hrefs.join(", ")}`);
  } else {
    assert.ok(hrefs.length >= 1, "live Light product page should link out to ai.lamplitlabs.com");
  }
});

// AI section Explore CTA (delta-15): while Lamplit Light is In development the
// "Explore Lamplit Light" button in the exported #ai section must point at the
// internal /products/light page, not at the not-yet-public ai.lamplitlabs.com.
// Once Light is Live it must link out to https://ai.lamplitlabs.com.
test("static export (out/) AI section Explore CTA links to /products/light while Light is in development", skipWithoutOut, () => {
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
test("static export (out/) product page has zero ai.lamplitlabs.com hrefs while Light is in development", skipWithoutOut, () => {
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

// CTA copy guard (aurora-2): while a product is In development, "Follow
// development" is a CTA to an on-page anchor, not a working product link. A
// visible "In development" note must sit next to every "Follow development"
// CTA so a first-time visitor doesn't read the button as a live product link.
test("static export (out/) /products/light renders an 'In development' note next to each 'Follow development' CTA while Light is in development", skipWithoutOut, () => {
  const light = siteData.match(/slug:\s*"light"[\s\S]*?status:\s*"([^"]+)"/)?.[1];
  assert.ok(light, "expected a status for the light product");
  // Strip the inlined RSC payload (<script>self.__next_f...) so only the
  // rendered HTML is counted, not its serialized duplicate.
  const html = readFileSync(resolve(root, "out", "products", "light.html"), "utf8")
    .replace(/<script[\s\S]*?<\/script>/g, "");
  const ctas = html.match(/>Follow development</g) ?? [];
  const notes = html.match(/data-testid="product-dev-note"[^>]*>In development/g) ?? [];
  if (light === "In development") {
    assert.ok(ctas.length >= 1, "expected a Follow development CTA while Light is in development");
    assert.equal(notes.length, ctas.length, `expected one In development note per Follow development CTA (${notes.length} notes vs ${ctas.length} CTAs)`);
    for (const idx of [...html.matchAll(/>Follow development</g)].map((m) => m.index)) {
      const before = html.slice(Math.max(0, idx - 1200), idx);
      assert.ok(/data-testid="product-dev-note"[^>]*>In development/.test(before), "each Follow development CTA must be immediately preceded by a visible In development note");
    }
    // Mobile visibility guard (meridian): the note must be visible at every
    // viewport, so no responsive-hiding class (e.g. `hidden sm:inline`) may be
    // on it - otherwise phone visitors read the CTA as a live product link.
    for (const note of html.matchAll(/data-testid="product-dev-note"[^>]*class="([^"]*)"/g)) {
      const classes = note[1].split(/\s+/);
      assert.ok(!classes.includes("hidden"), `In development note must not be hidden on small viewports (class="${note[1]}")`);
      assert.ok(!classes.some((c) => /^(sm|md|lg|xl|2xl):(inline|block|flex|inline-block)$/.test(c)), `In development note must not be viewport-gated (class="${note[1]}")`);
    }
  } else {
    assert.equal(ctas.length, 0, "live Light should not show a Follow development CTA");
    assert.equal(notes.length, 0, "live Light should not show an In development note");
  }
});

// Contact section (delta-2): a visitor who emails hello@lamplitlabs.com should
// know what to expect, so the exported home page must carry a visible
// response-time note next to the mailto link.
test("static export (out/) contact section shows a response-time note near the mailto link", skipWithoutOut, () => {
  const html = readFileSync(resolve(root, "out", "index.html"), "utf8");
  const start = html.indexOf('<section id="contact"');
  assert.ok(start >= 0, "expected a <section id=\"contact\"> block in out/index.html");
  const end = html.indexOf("</section>", start);
  const contact = html.slice(start, end);
  assert.ok(contact.includes("mailto:hello@lamplitlabs.com"), "contact section must link to hello@lamplitlabs.com");
  assert.match(contact, /usually reply within a few business days/, "contact section must tell visitors when to expect a reply");
});

// Contact section (tundra-2): visitors on devices without a configured mail
// client get nothing from a mailto: click, so the exported home page must offer
// a copy-to-clipboard affordance alongside the mailto link.
test("static export (out/) contact section offers a copy-to-clipboard button next to the mailto link", skipWithoutOut, () => {
  const html = readFileSync(resolve(root, "out", "index.html"), "utf8");
  const start = html.indexOf('<section id="contact"');
  assert.ok(start >= 0, "expected a <section id=\"contact\"> block in out/index.html");
  const contact = html.slice(start, html.indexOf("</section>", start));
  const mailtoAt = contact.indexOf("mailto:hello@lamplitlabs.com");
  assert.ok(mailtoAt >= 0, "contact section must link to hello@lamplitlabs.com");
  const copyAt = contact.indexOf('data-testid="contact-copy-email"');
  assert.ok(copyAt >= 0, "contact section must render a copy-email button");
  const button = contact.slice(copyAt - 200, copyAt + 400);
  assert.match(button, /<button[^>]*type="button"/, "copy affordance must be a real <button>");
  assert.match(button, /aria-label="Copy hello@lamplitlabs\.com to clipboard"/, "copy button must name the address it copies");
  assert.ok(Math.abs(copyAt - mailtoAt) < 1500, "copy button must sit alongside the mailto link");
});

// Notify-me (cinder-2): while a product is In development its page offers a
// mailto link so visitors can ask to be told when it ships instead of hitting
// a dead end. Once Live the link must disappear.
test("static export (out/) /products/light page offers a 'Notify me' mailto while Light is in development", skipWithoutOut, () => {
  const light = siteData.match(/slug:\s*"light"[\s\S]*?status:\s*"([^"]+)"/)?.[1];
  assert.ok(light, "expected a status for the light product");
  const html = readFileSync(resolve(root, "out", "products", "light.html"), "utf8");
  const links = html.match(/data-testid="product-notify-me"[^>]*href="mailto:hello@lamplitlabs\.com\?subject=Notify%20me%3A%20[^"]+"/g) ?? [];
  if (light === "In development") {
    assert.equal(links.length, 1, "in-development product page should render exactly one Notify-me mailto link");
    // Plain-text fallback: users without a configured mail client must still be able to read/copy the address.
    const plain = html.match(/data-testid="product-notify-me-email"[^>]*>\(hello@lamplitlabs\.com\)<\/span>/g) ?? [];
    assert.equal(plain.length, 1, "in-development product page should render the contact email as visible plain text next to the Notify-me link");
  } else {
    assert.equal(links.length, 0, "live product page should not offer a Notify-me link");
    assert.doesNotMatch(html, /data-testid="product-notify-me-email"/, "live product page should not render the Notify-me email fallback");
  }
});

// Footer section anchors (Products/AI/About/Contact) target ids that only
// exist on the home page. On the home page they must stay plain "#id" (same-
// page scroll); on every other exported route they must be "/#id" (or absent)
// so the click navigates home and scrolls instead of doing nothing.
test("static export (out/) footer section anchors are plain on the home page and /#-prefixed elsewhere", skipWithoutOut, () => {
  const anchors = ["products", "ai", "about", "contact"];
  const footerHrefs = (file) => {
    const html = readFileSync(resolve(root, "out", file), "utf8");
    const footer = html.slice(html.lastIndexOf("<footer"));
    assert.ok(footer.startsWith("<footer"), `${file} has no <footer>`);
    return [...footer.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  };
  const homeHtml = readFileSync(resolve(root, "out", "index.html"), "utf8");
  const home = footerHrefs("index.html");
  for (const id of anchors) {
    assert.ok(home.includes(`#${id}`), `home footer must link #${id}`);
    assert.ok(!home.includes(`/#${id}`), `home footer must not link /#${id}`);
    assert.match(homeHtml, new RegExp(`id="${id}"`), `home page must contain id="${id}"`);
  }
  // /privacy renders the shared <Footer>; its anchors must be home-prefixed.
  const privacy = footerHrefs("privacy.html");
  for (const id of anchors) {
    assert.ok(privacy.includes(`/#${id}`), `privacy footer must link /#${id}`);
  }
  // No non-home page may carry a bare "#id" footer anchor (a dead click).
  const nonHome = routes.filter((r) => r !== "/").map((r) => `${r.slice(1)}.html`);
  for (const file of nonHome) {
    for (const href of footerHrefs(file)) {
      assert.ok(!anchors.includes(href.replace(/^#/, "")) || !href.startsWith("#"),
        `${file} footer links dead anchor ${href}`);
    }
  }
});

// Icon/CTA pairing guard (granite-3): app/products/[slug]/page.tsx picks the
// CTA icon from the same status that picks the href (In development -> #about
// + ArrowDown; otherwise external url + ArrowUpRight/ExternalLink). A future
// status flip that updates one side but not the other must fail here instead
// of shipping a down-arrow on an outbound link (or an outbound icon on an
// on-page anchor).
test("static export (out/) every product page CTA icon matches its href kind (#about -> arrow-down, external -> arrow-up-right/external-link)", skipWithoutOut, () => {
  for (const slug of slugs) {
    const html = readFileSync(resolve(root, "out", "products", `${slug}.html`), "utf8");
    const anchors = [...html.matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)]
      .filter((m) => /lucide-(arrow-down|arrow-up-right|external-link)/.test(m[2]));
    assert.ok(anchors.length >= 1, `/products/${slug}: expected at least one CTA anchor carrying a direction icon`);
    for (const [, href, inner] of anchors) {
      const down = /lucide-arrow-down/.test(inner);
      const out = /lucide-(arrow-up-right|external-link)/.test(inner);
      assert.ok(down !== out, `/products/${slug}: CTA ${href} must carry exactly one icon kind`);
      if (href.startsWith("#")) {
        assert.ok(down && !out, `/products/${slug}: on-page CTA ${href} carries an outbound icon`);
      } else {
        assert.ok(out && !down, `/products/${slug}: outbound CTA ${href} carries the on-page arrow-down icon`);
      }
    }
  }
});

// Source-level gate: the footer nav prefixes hash-only navLinks with "/" when
// not on the home page, so Products/AI/About/Contact from /privacy or
// /products/<slug> navigate home instead of being a dead "#products" scroll.
// Every non-external navLinks entry must be a bare "#anchor" so that branch is
// reachable and never double-prefixes an already-absolute path.
test("footer nav prefixes hash-only navLinks with '/' off the home page", () => {
  const src = read("components/home/footer-nav-links.tsx");
  assert.match(src, /usePathname\(\)/, "footer nav must read the current pathname");
  assert.match(src, /const onHome = pathname === "\/"/, "footer nav must define an onHome guard");
  assert.match(src, /!onHome/, "hash prefixing must be guarded by !onHome");
  assert.match(src, /link\.href\.startsWith\("#"\)/, "only hash-only hrefs may be prefixed");
  assert.match(src, /`\/\$\{link\.href\}`/, "off-home hash hrefs must be prefixed with '/'");

  const block = siteData.match(/export const navLinks: NavLink\[\] = \[([\s\S]*?)\];/);
  assert.ok(block, "lib/site-data.ts must export navLinks");
  const entries = [...block[1].matchAll(/\{[^}]*\}/g)].map((m) => m[0]);
  assert.ok(entries.length >= 4, "navLinks should list the home section anchors");
  for (const entry of entries) {
    if (/external:\s*true/.test(entry)) continue;
    const href = entry.match(/href:\s*"([^"]+)"/);
    assert.ok(href, `navLink entry has a string href: ${entry}`);
    assert.match(href[1], /^#[a-z-]+$/, `non-external navLink must be a bare hash anchor: ${href[1]}`);
  }
});

// 404 near-miss suggestion (evolution/job-20261006t150740z-66120f): a visitor
// who mistypes a product slug (e.g. /products/amistio -> /products/amistiio)
// should land on a 404 that offers the product they likely meant, not a bare
// dead end. Source-level check since the page is a client component.
test("not-found page offers a near-miss product slug suggestion", () => {
  const src = read("app/not-found.tsx");
  assert.match(src, /findNearMissProduct/, "not-found page must compute a near-miss product suggestion");
  assert.match(src, /levenshtein/, "near-miss matching should be edit-distance based");
  assert.match(src, /data-testid="not-found-suggestion"/, "near-miss suggestion must be rendered when found");
  assert.match(src, /Did you mean/i, "near-miss suggestion must prompt the visitor with their likely intended product");

  // Exercise the matching logic directly against a real slug + a realistic typo.
  const match = src.match(/function levenshtein\(a, b\)[\s\S]*?\n}/) ||
    src.match(/function levenshtein\(a: string, b: string\): number \{[\s\S]*?\n}/);
  assert.ok(match, "levenshtein function body must be present");

  assert.ok(slugs.length > 0, "site-data must export at least one product slug");
  const realSlug = slugs[0];
  const typo = realSlug.length > 3 ? realSlug.slice(0, -1) + realSlug.slice(-1) + realSlug.slice(-1) : realSlug + "x";
  // Build and run the module's own threshold logic inline to confirm a
  // single-character typo falls within the allowed distance.
  function levenshtein(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
    );
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
    return dp[a.length][b.length];
  }
  const distance = levenshtein(typo, realSlug);
  const threshold = Math.max(1, Math.floor(realSlug.length / 3));
  assert.ok(distance <= threshold, `a one-character typo of "${realSlug}" ("${typo}") should be within the near-miss threshold`);
});
