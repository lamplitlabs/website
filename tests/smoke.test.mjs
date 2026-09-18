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

test("product catalog uses only known status values", () => {
  const src = readFileSync(resolve(root, "lib/site-data.ts"), "utf8");
  const statuses = [...src.matchAll(/^\s*status:\s*"([^"]+)"/gm)].map((m) => m[1]);
  assert.ok(statuses.length > 0, "expected at least one product status");
  for (const s of statuses) {
    assert.ok(["Live", "In development"].includes(s), `unknown status "${s}"`);
  }
});

test("a product marked comingSoon is never also marked Live", () => {
  const src = readFileSync(resolve(root, "lib/site-data.ts"), "utf8");
  const catalog = src.slice(src.indexOf("export const products"));
  // Split the catalog into per-product blocks keyed on each `slug:` line.
  const blocks = catalog.split(/^\s*slug:\s*"/m).slice(1);
  assert.ok(blocks.length > 0, "expected at least one product entry");
  for (const block of blocks) {
    const slug = block.slice(0, block.indexOf('"'));
    const comingSoon = /^\s*comingSoon:\s*true/m.test(block);
    const live = /^\s*status:\s*"Live"/m.test(block);
    assert.ok(
      !(comingSoon && live),
      `product "${slug}" sets comingSoon: true but status "Live" — a shipped product would show a "coming soon" badge`,
    );
  }
});
