// Minimal smoke test using Node's built-in test runner (no extra dependencies).
// Run with `npm test`. Extend with real unit tests as product code grows.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
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

test("every product cover resolves to a file under public/ and slugs are unique", () => {
  const src = readFileSync(resolve(root, "lib/site-data.ts"), "utf8");
  const catalog = src.slice(src.indexOf("export const products"));
  const slugs = [...catalog.matchAll(/^\s*slug:\s*"([^"]+)"/gm)].map((m) => m[1]);
  const covers = [...catalog.matchAll(/^\s*cover:\s*"([^"]+)"/gm)].map((m) => m[1]);
  assert.ok(slugs.length > 0, "expected at least one product slug");
  assert.equal(covers.length, slugs.length, "every product needs exactly one cover");
  assert.deepEqual(
    [...new Set(slugs)],
    slugs,
    `duplicate product slugs: ${slugs.filter((s, i) => slugs.indexOf(s) !== i).join(", ")}`,
  );
  for (const cover of covers) {
    assert.ok(cover.startsWith("/"), `cover "${cover}" must be an absolute public path`);
    assert.ok(
      existsSync(resolve(root, "public", cover.slice(1))),
      `cover "${cover}" does not exist under public/ — the product card would render a broken image`,
    );
  }
});

// docs/memory/2026-09-11-public-copy-describes-outcomes-not-method.md: public copy
// describes what a model does for the buyer, never the training method. Guard the
// files that carry Lamplit Light copy so a later edit cannot reintroduce it silently.
// "pipeline" is deliberately not banned: the feature spec and ADR name the public
// "five-stage build pipeline" label; the banned words are the method itself.
test("public product copy contains no training-method words", () => {
  const banned = /distil|teacher|student|copilot-distill/i;
  const files = [
    "lib/site-data.ts",
    "components/home/ai-section.tsx",
    ...readdirSync(resolve(root, "public/covers"))
      .filter((f) => f.endsWith(".svg"))
      .map((f) => `public/covers/${f}`),
  ];
  for (const file of files) {
    const lines = readFileSync(resolve(root, file), "utf8").split("\n");
    lines.forEach((line, i) => {
      assert.ok(
        !banned.test(line),
        `${file}:${i + 1} mentions a training-method word (${line.trim()}) — public copy describes outcomes, not method`,
      );
    });
  }
});
