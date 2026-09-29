// Unit test for the status helpers in lib/site-data.ts (no extra dependencies).
// The TypeScript source is transpiled with the project's own `typescript`
// devDependency and imported, so the real isProductLive/isProductInDevelopment
// implementations run against the real product catalog. Guards against a
// future edit that changes a product's literal `status` string (or the helper
// comparisons) so the two drift apart.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(fileURLToPath(import.meta.url), "..", "..");
const source = readFileSync(resolve(root, "lib/site-data.ts"), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const siteData = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const { products, isProductLive, isProductInDevelopment } = siteData;

const literalStatuses = [...source.matchAll(/^\s*status:\s*"([^"]+)"/gm)].map((m) => m[1]);

test("status helpers are exported and the catalog has products", () => {
  assert.equal(typeof isProductLive, "function");
  assert.equal(typeof isProductInDevelopment, "function");
  assert.ok(Array.isArray(products) && products.length > 0);
});

test("isProductLive/isProductInDevelopment agree with each product's literal status", () => {
  for (const product of products) {
    const live = isProductLive(product);
    const inDev = isProductInDevelopment(product);
    assert.ok(!(live && inDev), `${product.slug}: cannot be both Live and In development`);
    if (product.status === undefined) {
      assert.equal(live, false, `${product.slug}: no status must not be Live`);
      assert.equal(inDev, false, `${product.slug}: no status must not be In development`);
    } else {
      assert.equal(live, product.status === "Live", `${product.slug}: isProductLive vs status "${product.status}"`);
      assert.equal(
        inDev,
        product.status === "In development",
        `${product.slug}: isProductInDevelopment vs status "${product.status}"`,
      );
      assert.ok(live || inDev, `${product.slug}: status "${product.status}" is recognised by neither helper`);
    }
  }
});

test("every literal status string in the source is recognised by exactly one helper", () => {
  assert.ok(literalStatuses.length > 0, "expected at least one product status in source");
  for (const status of literalStatuses) {
    const hits = [isProductLive({ status }), isProductInDevelopment({ status })].filter(Boolean);
    assert.equal(hits.length, 1, `status "${status}" matched ${hits.length} helpers`);
  }
});

test("helpers reject unknown or missing status values", () => {
  for (const status of [undefined, "", "live", "Coming soon"]) {
    assert.equal(isProductLive({ status }), false);
    assert.equal(isProductInDevelopment({ status }), false);
  }
});

// Regression guard for lib/site-data.ts isProductInDevelopment: only the exact
// literal "In development" flips the in-development CTA/badge. A typo, case or
// whitespace change, a renamed status, or any other truthy value must be false.
test("isProductInDevelopment returns true only for the exact literal \"In development\"", () => {
  assert.equal(isProductInDevelopment({ status: "In development" }), true);
  const nearMisses = [
    "in development",
    "IN DEVELOPMENT",
    "In Development",
    "In development ",
    " In development",
    "In-development",
    "Indevelopment",
    "In dev",
    "Development",
    "In developement",
    "Live",
    true,
    1,
    {},
    [],
    ["In development"],
    null,
  ];
  for (const status of nearMisses) {
    assert.equal(
      isProductInDevelopment({ status }),
      false,
      `status ${JSON.stringify(status)} must not count as In development`,
    );
  }
});

// Drift guard: every product status is a ProductStatus member, and the README
// product table agrees with lib/site-data.ts (see the strict marker test below).
const productStatusUnion = source.match(/export type ProductStatus\s*=\s*([^;]+);/);
const productStatusValues = [...(productStatusUnion?.[1] ?? "").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const readme = readFileSync(resolve(root, "README.md"), "utf8");
const fold = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const readmeRows = new Map(
  [...readme.matchAll(/^\|\s*\*\*([^*]+)\*\*\s*\|([^|]*)\|/gm)].map((m) => [fold(m[1].trim()), m[2]]),
);

test("every product status is one of the ProductStatus union values", () => {
  assert.ok(productStatusValues.length > 0, "could not read ProductStatus union from lib/site-data.ts");
  for (const product of products) {
    assert.ok(
      productStatusValues.includes(product.status),
      `${product.slug}: status ${JSON.stringify(product.status)} not in ProductStatus (${productStatusValues.join(", ")})`,
    );
  }
});

// Strict drift guard: every
// README product row must carry exactly one `**<ProductStatus>**` marker and it
// must equal the product's status in lib/site-data.ts, so no row can imply a
// status by omission or name two statuses at once.
test("every README product row carries exactly one status marker equal to site-data status", () => {
  assert.ok(productStatusValues.length > 0, "could not read ProductStatus union from lib/site-data.ts");
  assert.ok(readmeRows.size > 0, "no product rows found in README.md");
  const markerRe = new RegExp(`\\*\\*(${productStatusValues.map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\*\\*`, "g");
  for (const product of products) {
    const row = readmeRows.get(fold(product.name));
    assert.ok(row !== undefined, `${product.slug}: "${product.name}" has no row in the README product table`);
    const markers = [...row.matchAll(markerRe)].map((m) => m[1]);
    assert.equal(
      markers.length,
      1,
      `${product.slug}: README row must carry exactly one status marker, found ${markers.length} (${markers.join(", ") || "none"})`,
    );
    assert.equal(markers[0], product.status, `${product.slug}: README says "${markers[0]}", site-data says "${product.status}"`);
  }
});

// Drift guard: slugs are URL path segments (app/products/[slug]), so each must
// be plain ASCII lowercase-hyphenated and derived from the product name after
// folding diacritics (e.g. "Fachsprachprüfung" -> "fachsprachprufung"). Some
// slugs are deliberately shorter than the name ("light" for "Lamplit Light"),
// so every slug token must be a token of the folded name rather than the whole.
const slugify = (s) => fold(s).replace(/[^a-z0-9\s-]/g, "").trim().split(/[\s-]+/).filter(Boolean);

test("every product slug is ASCII, unique and derived from the diacritic-folded product name", () => {
  const seen = new Set();
  for (const product of products) {
    assert.match(product.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${product.slug}: slug must be lowercase ASCII with single hyphens`);
    assert.ok(!seen.has(product.slug), `${product.slug}: duplicate slug`);
    seen.add(product.slug);
    const nameTokens = slugify(product.name);
    for (const token of product.slug.split("-")) {
      assert.ok(
        nameTokens.includes(token),
        `${product.slug}: token "${token}" is not in folded name "${nameTokens.join("-")}" (from "${product.name}")`,
      );
    }
  }
});

// Drift guard (both directions): the README product table lists exactly the
// products in lib/site-data.ts — no missing rows, no stale rows for removed or
// renamed products, and no duplicate rows. Add a product to both places, or
// remove it from both.
const readmeRowNames = [...readme.matchAll(/^\|\s*\*\*([^*]+)\*\*\s*\|/gm)].map((m) => fold(m[1].trim()));

test("README product table lists exactly the products in lib/site-data.ts, once each", () => {
  const productNames = products.map((p) => fold(p.name));
  assert.deepEqual(
    [...readmeRowNames].sort(),
    [...productNames].sort(),
    "README product rows must correspond one-to-one with lib/site-data.ts products",
  );
  assert.equal(new Set(readmeRowNames).size, readmeRowNames.length, "README has duplicate product rows");
  assert.equal(new Set(productNames).size, productNames.length, "lib/site-data.ts has duplicate product names");
});

// Every "In development" product must link a real place to follow progress
// (`trackingDoc`): an https URL or a repository-relative doc that exists.
// Without it, a product can sit behind a stale status label indefinitely
// and the "Follow development" CTA has nothing real to point at.
test("every In development product links a real trackingDoc", () => {
  const inDev = products.filter((p) => isProductInDevelopment(p));
  assert.ok(inDev.length > 0, "expected at least one In development product in the catalog");
  for (const product of inDev) {
    assert.equal(
      typeof product.trackingDoc,
      "string",
      `${product.slug}: In development products must set trackingDoc`,
    );
    const doc = product.trackingDoc.trim();
    assert.ok(doc.length > 0, `${product.slug}: trackingDoc must not be empty`);
    if (/^https:\/\//.test(doc)) {
      assert.doesNotThrow(() => new URL(doc), `${product.slug}: trackingDoc "${doc}" is not a valid URL`);
    } else {
      assert.ok(
        existsSync(resolve(root, doc)),
        `${product.slug}: trackingDoc "${doc}" is neither an https URL nor an existing repo file`,
      );
    }
  }
});
