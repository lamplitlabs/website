// Unit test for the status helpers in lib/site-data.ts (no extra dependencies).
// The TypeScript source is transpiled with the project's own `typescript`
// devDependency and imported, so the real isProductLive/isProductInDevelopment
// implementations run against the real product catalog. Guards against a
// future edit that changes a product's literal `status` string (or the helper
// comparisons) so the two drift apart.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

// Drift guard: every product status is a ProductStatus member, and the README
// product table agrees with lib/site-data.ts. Every README row must carry an
// explicit `— **Status**` marker equal to the product's status, so the README
// can never silently present an in-development product as if it were live.
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

test("README product table status markers match lib/site-data.ts", () => {
  assert.ok(readmeRows.size > 0, "no product rows found in README.md");
  for (const product of products) {
    const row = readmeRows.get(fold(product.name));
    assert.ok(row !== undefined, `${product.slug}: "${product.name}" has no row in the README product table`);
    const marker = row.match(/\*\*([^*]+)\*\*\s*$/)?.[1]?.trim();
    assert.ok(marker !== undefined, `${product.slug}: README row has no **Status** marker`);
    assert.equal(marker, product.status, `${product.slug}: README says "${marker}", site-data says "${product.status}"`);
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
