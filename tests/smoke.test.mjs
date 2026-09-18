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

// README.md's product table mirrors lib/site-data.ts (the README says so itself).
// A "**Live**" / "**In development**" label in a README row must match that
// product's `status`; a product still in development must carry the label so
// visitors reading the README are not told it ships today. Names are compared
// without diacritics because the catalog spells "Fachsprachprufung" ASCII-only.
test("README product table agrees with lib/site-data.ts on product status", async () => {
  const { products } = await loadSiteData();
  const fold = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const readme = readFileSync(resolve(root, "README.md"), "utf8").split("\n");
  const rows = new Map();
  readme.forEach((line, i) => {
    const m = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|(.*)\|/);
    if (!m) return;
    const label = m[2].match(/\*\*(Live|In development)\*\*/)?.[1];
    rows.set(fold(m[1]), { line: i + 1, label });
  });
  assert.ok(rows.size > 0, "README.md has no product table rows");
  for (const p of products) {
    const row = rows.get(fold(p.name));
    assert.ok(row, `README.md product table has no row for "${p.name}" (lib/site-data.ts)`);
    if (row.label !== undefined) {
      assert.equal(
        row.label,
        p.status,
        `README.md:${row.line} labels "${p.name}" as "${row.label}" but lib/site-data.ts says "${p.status}"`,
      );
    } else {
      assert.ok(
        p.status === "Live",
        `README.md:${row.line} shows "${p.name}" without a status label but lib/site-data.ts says "${p.status}" — add "**${p.status}**" to the row`,
      );
    }
  }
});
