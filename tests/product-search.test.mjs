// The product grid's free-text search (lib/product-search.ts) must filter the
// real catalog by case-insensitive name/description substring, and the grid
// must actually wire it into `filteredProducts`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(fileURLToPath(import.meta.url), "..", "..");
async function load(rel) {
  const source = readFileSync(resolve(root, rel), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const { products } = await load("lib/site-data.ts");
const search = await load("lib/product-search.ts");
const { filterProductsByQuery, matchesProductQuery } = search;

test("blank or whitespace query keeps every product", () => {
  assert.equal(filterProductsByQuery(products, "").length, products.length);
  assert.equal(filterProductsByQuery(products, "   ").length, products.length);
});

test("query matches a product by name substring, case-insensitively", () => {
  const target = products[0];
  const fragment = target.name.slice(1, Math.min(target.name.length, 4)).toUpperCase();
  const result = filterProductsByQuery(products, fragment);
  assert.ok(result.includes(target), `expected ${target.name} to match "${fragment}"`);
  for (const p of result) assert.ok(matchesProductQuery(p, fragment));
});

test("query matches by description substring when the name does not match", () => {
  const target = products.find((p) => p.description.split(/\s+/).some((w) => w.length > 5 && !p.name.toLowerCase().includes(w.toLowerCase())));
  assert.ok(target, "catalog has a product with a distinctive description word");
  const word = target.description.split(/\s+/).find((w) => w.length > 5 && !target.name.toLowerCase().includes(w.toLowerCase()));
  assert.ok(filterProductsByQuery(products, word).includes(target));
});

test("nonsense query matches nothing", () => {
  assert.deepEqual(filterProductsByQuery(products, "zzqxv-no-such-product"), []);
});

test("product grid wires the search input into filteredProducts", () => {
  const grid = readFileSync(resolve(root, "components/product-grid.tsx"), "utf8");
  assert.match(grid, /data-testid="product-search"/);
  assert.match(grid, /const filteredProducts = filterProductsByQuery\(/);
});

test("search query is mirrored into the ?q= URL param so a searched view can be shared/reloaded", () => {
  const { withSearchQueryParam, SEARCH_QUERY_PARAM } = search;
  assert.equal(SEARCH_QUERY_PARAM, "q");
  const base = new URL("https://lamplitlabs.com/?category=AI");
  const withQ = withSearchQueryParam(base, " ai ");
  assert.equal(withQ.searchParams.get("q"), "ai");
  assert.equal(withQ.searchParams.get("category"), "AI", "category param is preserved");
  assert.equal(withSearchQueryParam(withQ, "").searchParams.has("q"), false, "blank query removes ?q=");

  const grid = readFileSync(resolve(root, "components/product-grid.tsx"), "utf8");
  assert.match(grid, /window\.history\.replaceState\([\s\S]*?withSearchQueryParam\(new URL\(window\.location\.href\), next\)/, "grid writes ?q= via replaceState on search input");
  assert.match(grid, /\.get\(\s*SEARCH_QUERY_PARAM\s*\)/, "grid restores ?q= on mount");
});

test("query matches a product by tag substring (case-insensitive) when name/description do not", () => {
  const target = products.find((p) => p.tags?.some((t) => {
    const needle = t.slice(0, Math.min(t.length, 6)).toLowerCase();
    return needle.length >= 3 && !p.name.toLowerCase().includes(needle) && !p.description.toLowerCase().includes(needle);
  }));
  assert.ok(target, "catalog has a product whose tag is not in its name/description");
  const tag = target.tags.find((t) => {
    const needle = t.slice(0, Math.min(t.length, 6)).toLowerCase();
    return needle.length >= 3 && !target.name.toLowerCase().includes(needle) && !target.description.toLowerCase().includes(needle);
  });
  const fragment = tag.slice(0, Math.min(tag.length, 6)).toUpperCase();
  const result = filterProductsByQuery(products, fragment);
  assert.ok(result.includes(target), `expected ${target.name} to match tag fragment "${fragment}"`);
  for (const p of result) assert.ok(matchesProductQuery(p, fragment));
  assert.ok(matchesProductQuery(target, tag.toLowerCase()), "full tag matches lower-cased");
  assert.deepEqual(filterProductsByQuery(products, "zzqxv-no-such-tag-or-name"), []);
});

test("clicking a product tag chip filters the grid to products sharing that tag", () => {
  const grid = readFileSync(resolve(root, "components/product-grid.tsx"), "utf8");
  // The rendered tag element is a button whose onClick hands the tag text to the grid…
  assert.match(grid, /<button[\s\S]*?data-testid="product-tag"[\s\S]*?onClick=\{\(event\) => \{[\s\S]*?onTagClick\(tag\);/, "tag chip has an onClick that forwards the tag");
  // …and the grid's handler feeds it into the same query state that filterProductsByQuery reads.
  assert.match(grid, /const filterByTag = \(tag: string\) => \{[\s\S]*?setActiveCategory\("All"\);[\s\S]*?updateQuery\(tag\);/, "tag handler resets the category and sets the search query");
  assert.match(grid, /onTagClick=\{filterByTag\}/);
  assert.match(grid, /const filteredProducts = filterProductsByQuery\(categoryProducts, query\)/);
  // Every product's tags narrow the catalog to products sharing the tag (and never to zero).
  for (const p of products) {
    for (const tag of p.tags ?? []) {
      const result = filterProductsByQuery(products, tag);
      assert.ok(result.includes(p), `${p.name} matches its own tag "${tag}"`);
      for (const r of result) assert.ok(matchesProductQuery(r, tag));
    }
  }
});
