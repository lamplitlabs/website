// Minimal smoke test using Node's built-in test runner (no extra dependencies).
// Run with `npm test`. Extend with real unit tests as product code grows.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(import.meta.url), "..", "..");
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

test("package.json declares the scripts CI and AGENTS.md rely on", () => {
  for (const name of ["dev", "build", "lint", "typecheck", "test"]) {
    assert.ok(pkg.scripts?.[name], `missing script "${name}"`);
  }
});

test("core product entry points exist", () => {
  for (const file of ["app/layout.tsx", "app/page.tsx", "lib/site-data.ts"]) {
    assert.ok(existsSync(resolve(root, file)), `missing ${file}`);
  }
});

// Load the real catalog: transpile lib/site-data.ts with the project's own
// TypeScript so the assertions below check data, not source formatting.
async function loadSiteData() {
  const ts = (await import("typescript")).default;
  const src = readFileSync(resolve(root, "lib/site-data.ts"), "utf8");
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const url = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
  return import(url);
}

test("product catalog uses only known status values", async () => {
  const { products } = await loadSiteData();
  assert.ok(products.length > 0, "expected at least one product");
  for (const p of products) {
    if (p.status === undefined) continue; // status is optional in the Product type
    assert.ok(
      ["Live", "In development"].includes(p.status),
      `product "${p.slug}" has unknown status "${p.status}"`,
    );
  }
});

test("a product marked comingSoon is never also marked Live", async () => {
  const { products, isProductLive } = await loadSiteData();
  for (const p of products) {
    assert.ok(
      !(p.comingSoon && isProductLive(p)),
      `product "${p.slug}" sets comingSoon: true but status "Live" — a shipped product would show a "coming soon" badge`,
    );
  }
});
