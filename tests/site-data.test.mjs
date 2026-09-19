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
// product table agrees with lib/site-data.ts. A README row may carry an explicit
// `— **Status**` marker; when it does it must equal the product's status, and a
// product that is not Live must always carry one so the README never presents
// an in-development product as if it were live.
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
    if (marker !== undefined) {
      assert.equal(marker, product.status, `${product.slug}: README says "${marker}", site-data says "${product.status}"`);
    } else {
      assert.equal(product.status, "Live", `${product.slug}: status "${product.status}" must be marked in the README row`);
    }
  }
});
