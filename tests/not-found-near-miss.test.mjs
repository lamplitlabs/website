// The 404 page (app/not-found.tsx) offers "Did you mean <product>?" when a
// visitor lands on a product URL with a slip in it. These tests run the page's
// own matcher, not a mirror copy: everything above `export default function
// NotFound` is transpiled and imported with the real catalogue from
// lib/site-data.ts.
// How it fails: a recovered slip names the URL and the href it got instead of
// /products/<slug>; a guard that let go names the junk URL and what it suggested.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(fileURLToPath(import.meta.url), "..", "..");
const toModule = (source) => {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
};

const siteData = await toModule(readFileSync(resolve(root, "lib/site-data.ts"), "utf8"));
const { products } = siteData;

const pageSource = readFileSync(resolve(root, "app/not-found.tsx"), "utf8");
const helpers = pageSource.split("export default function NotFound")[0];
assert.ok(helpers !== pageSource, "app/not-found.tsx must export a default NotFound component");
const importLine = /^import \{([^}]+)\} from "@\/lib\/site-data";$/m;
assert.match(helpers, importLine, "the 404 helpers take the catalogue from @/lib/site-data");
globalThis.__notFoundSiteData = siteData;
const helperModule = helpers
  .replace(/^"use client";$/m, "")
  .replace(importLine, (_, names) => `const {${names}} = globalThis.__notFoundSiteData;`)
  .replace(/^import .*$/gm, "")
  + "\nexport { findNearMiss, findNearMissProduct };\n";
const { findNearMiss, findNearMissProduct } = await toModule(helperModule);

const slugs = products.map((p) => p.slug);
const capitalise = (s) => s[0].toUpperCase() + s.slice(1);

test("the real slug in the wrong case or place suggests the product", () => {
  assert.ok(slugs.length > 0, "site-data must export products");
  for (const slug of slugs) {
    const want = `/products/${slug}`;
    for (const path of [
      `/products/${capitalise(slug)}`,
      `/products/${slug.toUpperCase()}`,
      `/products/${slug}/`.replace(slug, capitalise(slug)),
      `/Products/${slug}`,
      `/product/${slug}`,
      `/product/${capitalise(slug)}/`,
      `/${slug}`,
      `/${capitalise(slug)}`,
    ]) {
      assert.equal(findNearMiss(path)?.href, want, `${path} should suggest ${want}`);
    }
  }
  // The task's own examples, by name.
  assert.equal(findNearMiss("/products/Eszett")?.href, "/products/eszett");
  assert.equal(findNearMiss("/eszett")?.href, "/products/eszett");
  assert.equal(findNearMiss("/product/leben-in-deutschland")?.href, "/products/leben-in-deutschland");
});

test("a hyphen-only difference suggests the product", () => {
  const hyphenated = slugs.filter((s) => s.includes("-"));
  assert.ok(hyphenated.length > 0, "catalogue has hyphenated slugs");
  for (const slug of hyphenated) {
    const joined = slug.replace(/-/g, "");
    for (const path of [`/products/${joined}`, `/product/${joined}`, `/${joined}`, `/products/${capitalise(joined)}`]) {
      assert.equal(findNearMiss(path)?.href, `/products/${slug}`, `${path} should suggest /products/${slug}`);
    }
  }
  // A hyphen in the wrong place is still a hyphen-only difference.
  const [first] = hyphenated;
  const moved = first.replace(/-/g, "").replace(/^(.{3})/, "$1-");
  assert.equal(findNearMiss(`/products/${moved}`)?.href, `/products/${first}`, `/products/${moved} should suggest ${first}`);
});

test("typos still go through the distance threshold and boundary guard, under every prefix", () => {
  const long = slugs.find((s) => Math.floor(s.length / 3) >= 2 && !s.includes("-"));
  assert.ok(long, "need a slug long enough for a threshold of 2");
  const swapped = long[0] + long.slice(1, -1).replace(/^(.)(.)/, "$2$1") + long[long.length - 1];
  for (const prefix of ["/products/", "/product/", "/"]) {
    assert.equal(findNearMiss(`${prefix}${swapped}`)?.href, `/products/${long}`, `${prefix}${swapped} should suggest ${long}`);
  }
});

test("real pages, unrelated words and deeper paths get no product suggestion", () => {
  for (const slug of slugs) {
    assert.equal(findNearMissProduct(`/products/${slug}`), undefined, `/products/${slug} is the real page`);
    assert.equal(findNearMissProduct(`/products/${slug}/`), undefined, `/products/${slug}/ is the real page`);
  }
  for (const junk of [
    "/products/night", "/products/flight", "/products/sight", "/night", "/product/night", "/Night",
    "/api", "/ai", "/privacy", "/admin", "/login", "/blog", "/", "/products", "/product",
    "/products/zzqxnosuch", "/zzqxnosuch", "/product/zzqxnosuch", "/products/zzqxnosuch/extra",
    "/products/eszett/extra", "/docs/eszett", "/productss/eszett", "/products/settings", "/products/lighter",
  ]) {
    const hit = findNearMiss(junk);
    assert.equal(hit, undefined, `${junk} must not suggest ${hit?.href}`);
  }
});

test("static-route suggestions still work beside the wider product matcher", () => {
  assert.equal(findNearMiss("/privcy")?.href, "/privacy");
  assert.equal(findNearMiss("/privacy-policy")?.href, "/privacy");
  assert.equal(findNearMiss("/ai-models")?.href, "/ai");
});
