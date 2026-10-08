// Guards the home hero paragraph (components/home/hero-section.tsx) against
// stale product claims. Each phrase the hero names must map to a product
// category or tag that exists in lib/site-data.ts, and phrases for products
// that were removed (e.g. "career resources" from the deleted Resume Builder /
// Career category) must never come back, so a first-time visitor is not
// promised a product that does not exist.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(fileURLToPath(import.meta.url), "..", "..");
const hero = readFileSync(resolve(root, "components/home/hero-section.tsx"), "utf8");
const source = readFileSync(resolve(root, "lib/site-data.ts"), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { products, productCategories } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

const heroText = hero.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").toLowerCase();
const live = new Set(
  [...productCategories, ...products.flatMap((p) => p.tags ?? [])].map((s) => s.toLowerCase()),
);

// hero phrase -> catalog category/tag that backs it
const claims = {
  "ai agent builder": "ai",
  "ai lab": "ai",
  "medical exam prep": "education",
  "citizenship tools": "education",
  "developer utilities": "developer tools",
  azure: "azure",
  compliance: "compliance",
};

const stale = ["career", "resume"];

test("hero paragraph mentions each claimed product area and each maps to a live category or tag", () => {
  for (const [phrase, backing] of Object.entries(claims)) {
    assert.ok(heroText.includes(phrase), `hero copy no longer says "${phrase}" - update the claims map`);
    assert.ok(live.has(backing), `"${phrase}" is backed by "${backing}" which is not a live category/tag`);
  }
});

test("hero paragraph does not name removed product areas", () => {
  for (const word of stale) {
    assert.ok(!heroText.includes(word), `hero copy still names removed product area "${word}"`);
    assert.ok(!live.has(word), `"${word}" unexpectedly reappeared as a live category/tag - update this test`);
  }
});
