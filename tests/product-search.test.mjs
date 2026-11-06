// The product grid's free-text search (lib/product-search.ts) must filter the
// real catalog by case-insensitive, word-by-word (AND) substring match, and the grid
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

test("query matches a product by title (tagline) word when name/description/tags do not", () => {
  const notElsewhere = (p, w) => {
    const needle = w.toLowerCase();
    return needle.length >= 4 && !p.name.toLowerCase().includes(needle) && !p.description.toLowerCase().includes(needle) && !(p.tags ?? []).some((t) => t.toLowerCase().includes(needle));
  };
  const pick = (p) => (p.title ?? "").split(/\s+/).map((w) => w.replace(/[^a-z0-9]/gi, "")).find((w) => notElsewhere(p, w));
  const target = products.find((p) => pick(p));
  assert.ok(target, "catalog has a product with a title word absent from its name/description/tags");
  const word = pick(target);
  const result = filterProductsByQuery(products, word.toUpperCase());
  assert.ok(result.includes(target), `expected ${target.name} to match title word "${word}"`);
  for (const p of result) assert.ok(matchesProductQuery(p, word));
  assert.ok(matchesProductQuery({ name: "x", description: "y", title: "Stay in control" }, "CONTROL"));
  assert.equal(matchesProductQuery({ name: "x", description: "y" }, "control"), false, "missing title does not throw or match");
});

test("query matches a product by longDescription (PDP body) word when name/title/description/tags do not", () => {
  const notElsewhere = (p, needle) =>
    needle.length >= 4 &&
    !p.name.toLowerCase().includes(needle) &&
    !(p.title ?? "").toLowerCase().includes(needle) &&
    !p.description.toLowerCase().includes(needle) &&
    !(p.tags ?? []).some((t) => t.toLowerCase().includes(needle));
  // Concrete case from the task: kenntnistrainer's detail copy mentions doctors.
  const kennt = products.find((p) => p.slug === "kenntnistrainer");
  assert.ok(kennt, "catalog has kenntnistrainer");
  assert.ok(kennt.longDescription.toLowerCase().includes("doctors"), "longDescription mentions doctors");
  assert.ok(notElsewhere(kennt, "doctors"), "'doctors' appears only in longDescription");
  const result = filterProductsByQuery(products, "DOCTORS");
  assert.ok(result.includes(kennt), "expected Kenntnistrainer to match a longDescription-only word");
  for (const p of result) assert.ok(matchesProductQuery(p, "doctors"));
  assert.ok(matchesProductQuery({ name: "x", description: "y", longDescription: "Built for doctors in Germany" }, "germany"));
  assert.equal(matchesProductQuery({ name: "x", description: "y" }, "germany"), false, "missing longDescription does not throw or match");
  // The grid must actually hand longDescription to the matcher.
  const grid = readFileSync(resolve(root, "components/product-grid.tsx"), "utf8");
  assert.match(grid, /const filteredProducts = filterProductsByQuery\(categoryProducts, query\)/);
  const siteData = readFileSync(resolve(root, "lib/site-data.ts"), "utf8");
  assert.match(siteData, /longDescription: string;/, "Product type carries longDescription so categoryProducts items expose it to the matcher");
  const searchSrc = readFileSync(resolve(root, "lib/product-search.ts"), "utf8");
  assert.match(searchSrc, /longDescription\?: string;/);
  assert.match(searchSrc, /^\s*\*.*longDescription/m, "doc comment mentions longDescription");
});

test("query folds diacritics so plain-ASCII typing matches accented catalog copy (Kenntnisprüfung)", () => {
  const kenntnistrainer = products.find((p) => p.slug === "kenntnistrainer");
  assert.ok(kenntnistrainer, "catalog has kenntnistrainer");
  const hasAccent = kenntnistrainer.title.includes("ü") || kenntnistrainer.longDescription.includes("ü");
  assert.ok(hasAccent, "kenntnistrainer copy uses an accented character the ASCII query must still match");
  const result = filterProductsByQuery(products, "prufung");
  assert.ok(result.includes(kenntnistrainer), "expected ASCII 'prufung' to match accented 'Kenntnisprüfung' copy");
  assert.ok(matchesProductQuery({ name: "x", description: "y", title: "Kenntnisprüfung simulation" }, "prufung"));
  // Accented queries must still match accented copy (no regression from folding).
  assert.ok(matchesProductQuery({ name: "x", description: "y", title: "Kenntnisprüfung simulation" }, "prüfung"));
});

test("query folds letters NFD keeps whole: 'strasse' finds 'Straße' (and æ, ø, đ, ł)", () => {
  const catalogue = [
    { name: "Plain", description: "Nothing special" },
    { name: "Kiez", description: "Finds every Straße in Berlin" },
    { name: "Nord", description: "Træning for Øresund", tags: ["Đà Nẵng", "Łódź"] },
  ];
  assert.deepEqual(filterProductsByQuery(catalogue, "strasse").map((p) => p.name), ["Kiez"]);
  assert.deepEqual(filterProductsByQuery(catalogue, "STRASSE berlin").map((p) => p.name), ["Kiez"]);
  // The native spelling still matches, in either case.
  assert.deepEqual(filterProductsByQuery(catalogue, "straße").map((p) => p.name), ["Kiez"]);
  assert.deepEqual(filterProductsByQuery(catalogue, "STRAẞE").map((p) => p.name), ["Kiez"]);
  for (const q of ["traening", "oresund", "da nang", "lodz", "Øresund", "łódź"]) {
    assert.deepEqual(filterProductsByQuery(catalogue, q).map((p) => p.name), ["Nord"], `"${q}" finds Nord`);
  }
  // œ→oe, ð→d, þ→th, upper and lower case, native spelling still matching.
  const more = [
    { name: "Plain", description: "Nothing special" },
    { name: "Atelier", description: "Œuvre complète", tags: ["Þingvellir", "Guðrún"] },
  ];
  for (const q of ["oeuvre", "thingvellir", "gudrun", "Œuvre", "þingvellir", "guðrún"]) {
    assert.deepEqual(filterProductsByQuery(more, q).map((p) => p.name), ["Atelier"], `"${q}" finds Atelier`);
  }
});

test("search finds a product by its Key Features highlight titles", () => {
  const withHighlights = products.filter((p) => p.highlights?.length);
  assert.ok(withHighlights.length > 0);
  for (const p of withHighlights) {
    for (const h of p.highlights) {
      const hits = search.filterProductsByQuery(products, h.title);
      assert.ok(hits.includes(p), `"${h.title}" should find ${p.name}`);
    }
  }
});

test("multi-word query matches word by word: 'Security Azure' finds Azure Compliance Matrix", () => {
  const target = products.find((p) => p.name === "Azure Compliance Matrix");
  assert.ok(target, "catalog has Azure Compliance Matrix");
  const result = filterProductsByQuery(products, "Security Azure");
  assert.ok(result.includes(target), "words in a different order from different chips still match");
  assert.ok(result.length < products.length, "a two-word query narrows the catalog");
  for (const p of result) {
    assert.ok(matchesProductQuery(p, "security") && matchesProductQuery(p, "azure"), `${p.name} matches every word`);
  }
  assert.ok(filterProductsByQuery(products, "  azure\tSECURITY  ").includes(target), "extra whitespace and case are ignored");
});

test("multi-word query is AND, not OR: one unknown word matches nothing", () => {
  assert.ok(filterProductsByQuery(products, "Azure").length > 0);
  assert.deepEqual(filterProductsByQuery(products, "Azure zzqxnosuch"), []);
});

test("an adjacent phrase that matched before still matches", () => {
  const target = products.find((p) => p.name === "Azure Compliance Matrix");
  assert.ok(filterProductsByQuery(products, "Compliance Matrix").includes(target));
});

test("results rank name matches first: 'azure' lists Azure products before products that only mention Azure elsewhere", () => {
  // Synthetic catalogue: the Azure-named product sits last, the others only mention Azure in body copy.
  const catalogue = [
    { name: "Helper", description: "Works with Azure subscriptions" },
    { name: "Notes", description: "Plain notes", highlights: [{ title: "Azure export", description: "x" }] },
    { name: "Azure Widget", description: "A widget" },
  ];
  assert.deepEqual(
    filterProductsByQuery(catalogue, "azure").map((p) => p.name),
    ["Azure Widget", "Helper", "Notes"],
    "name match first, ties keep catalogue order"
  );
  assert.deepEqual(filterProductsByQuery(catalogue, "").map((p) => p.name), ["Helper", "Notes", "Azure Widget"], "blank query keeps catalogue order");

  // Real catalogue: every query that hits a product name lists the name matches before the rest.
  for (const q of ["azure", "ai", "tools", "light"]) {
    const result = filterProductsByQuery(products, q);
    const hits = result.map((p) => p.name.toLowerCase().includes(q));
    assert.ok(hits.includes(true), `"${q}" matches at least one product name`);
    assert.deepEqual(hits, [...hits].sort((a, b) => Number(b) - Number(a)), `"${q}" lists name matches first: ${result.map((p) => p.name).join(", ")}`);
  }
  const azure = filterProductsByQuery(products, "azure");
  assert.ok(azure.length > 0 && azure[0].name.toLowerCase().includes("azure"), "first 'azure' result is an Azure product");
});

test("within equal name rank, tag matches come before description-only matches: 'security' lists Security-tagged products first", () => {
  // Synthetic catalogue: neither name contains the word; the tagged product sits last.
  const catalogue = [
    { name: "Helper", description: "Hardens your security posture", tags: ["Utilities"] },
    { name: "Notes", description: "Plain notes", tags: ["Productivity"], highlights: [{ title: "Security export", description: "x" }] },
    { name: "Vault", description: "Stores secrets", tags: ["Azure", "Security"] },
    { name: "Security Center", description: "A dashboard", tags: ["Web"] },
  ];
  assert.deepEqual(
    filterProductsByQuery(catalogue, "security").map((p) => p.name),
    ["Security Center", "Vault", "Helper", "Notes"],
    "name match first, then tag match, then catalogue order"
  );
  // A tag matches only as a whole tag or a whole word of it: "ai" ranks "Sovereign AI", not "Training".
  const chips = [
    { name: "One", description: "ai mention", tags: ["Training"] },
    { name: "Two", description: "plain", tags: ["Sovereign AI"] },
  ];
  assert.deepEqual(filterProductsByQuery(chips, "ai").map((p) => p.name), ["Two", "One"]);

  // Real catalogue: every non-name match tagged with the query word precedes the untagged ones.
  for (const q of ["security", "german", "germany", "language", "medical", "education"]) {
    const result = filterProductsByQuery(products, q);
    const rest = result.filter((p) => !p.name.toLowerCase().includes(q));
    const tagged = rest.map((p) => p.tags.some((t) => t.toLowerCase().split(/\s+/).includes(q) || t.toLowerCase() === q));
    assert.deepEqual(tagged, [...tagged].sort((a, b) => Number(b) - Number(a)), `"${q}" lists tagged products first: ${result.map((p) => p.name).join(", ")}`);
  }
  assert.equal(filterProductsByQuery(products, "germany")[0].name, "Leben in Deutschland", "'germany' starts with the Germany-tagged product");
});

test("punctuation in the copy is optional: 'drawio', 'ondevice', 'selfhosted' find their products", () => {
  const names = (q) => filterProductsByQuery(products, q).map((p) => p.name);
  for (const [q, name] of [
    ["drawio", "Azure Draw.io Assets"],
    ["Draw.io", "Azure Draw.io Assets"],
    ["ondevice", "Eszett"],
    ["on-device", "Eszett"],
    ["selfhosted", "Lamplit Light"],
    ["self-hosted", "Lamplit Light"],
    ["a1c2", "Eszett"],
  ]) {
    const result = names(q);
    assert.ok(result.includes(name), `"${q}" finds ${name}: got ${result.join(", ")}`);
    assert.ok(result.length < products.length, `"${q}" does not return the whole catalogue`);
  }
  // Synthetic: slash- and dot-joined words match without their punctuation, AND still applies.
  const catalogue = [
    { name: "Codec", description: "An Encoder/Decoder for OData v4.01" },
    { name: "Other", description: "Plain copy" },
  ];
  assert.deepEqual(filterProductsByQuery(catalogue, "encoderdecoder v401").map((p) => p.name), ["Codec"]);
  assert.deepEqual(filterProductsByQuery(catalogue, "drawiozzqx"), []);
  assert.deepEqual(filterProductsByQuery(products, "drawiozzqx"), []);
  assert.deepEqual(filterProductsByQuery(products, "Azure zzqxnosuch"), []);
});

test("did-you-mean: a query with one stray word suggests the query without it", () => {
  const { suggestProductQuery } = search;
  const drawio = products.find((p) => p.name === "Azure Draw.io Assets");
  assert.ok(drawio, "catalog has Azure Draw.io Assets");
  // The strict match stays AND: the stray word still empties filterProductsByQuery…
  assert.deepEqual(filterProductsByQuery(products, "drawio zzz"), []);
  // …and the suggestion drops it, so the grid can still list the product.
  const hint = suggestProductQuery(products, "drawio zzz");
  assert.ok(hint, "a two-word query with one stray word gets a suggestion");
  assert.equal(hint.query, "drawio");
  assert.equal(hint.dropped, "zzz");
  assert.ok(hint.products.includes(drawio));
  assert.deepEqual(hint.products, filterProductsByQuery(products, "drawio"));
  // The stray word can come first, and the kept words keep their spelling.
  const lead = suggestProductQuery(products, "zzqx Draw.io");
  assert.equal(lead?.query, "Draw.io");
  assert.ok(lead.products.includes(drawio));
  // Three words with one stray: the two good words still narrow (AND).
  const three = suggestProductQuery(products, "Security Azure zzqxnosuch");
  assert.equal(three?.query, "Security Azure");
  assert.deepEqual(three.products, filterProductsByQuery(products, "Security Azure"));
});

test("did-you-mean: no suggestion when the query matches, is one word, or no single drop helps", () => {
  const { suggestProductQuery } = search;
  assert.equal(suggestProductQuery(products, "Security Azure"), null, "a matching query needs no hint");
  assert.equal(suggestProductQuery(products, "drawiozzqx"), null, "a single word has nothing to drop");
  assert.equal(suggestProductQuery(products, "   "), null);
  assert.equal(suggestProductQuery(products, "zzqx no such product 7"), null, "nonsense still finds nothing");
  assert.equal(suggestProductQuery(products, "zzqx yyqx"), null);
  // The narrowest retry wins; on a tie the later word is dropped.
  const catalogue = [
    { name: "Alpha", description: "red green" },
    { name: "Beta", description: "red" },
    { name: "Gamma", description: "blue" },
  ];
  assert.equal(suggestProductQuery(catalogue, "red green blue")?.query, "red green");
  assert.equal(suggestProductQuery(catalogue, "green blue")?.query, "green");
});

test("did-you-mean: a typo inside a multi-word query is corrected, not dropped", () => {
  const { suggestProductQuery } = search;
  const compliance = products.find((p) => p.name === "Azure Compliance Matrix");
  assert.ok(compliance, "catalog has Azure Compliance Matrix");
  // The strict match stays AND, so the misspelled word still empties the grid…
  assert.deepEqual(filterProductsByQuery(products, "azure complianse"), []);
  // …and the hint corrects it instead of dropping it to the broader "azure".
  const hint = suggestProductQuery(products, "azure complianse");
  assert.equal(hint?.query, "azure compliance");
  assert.equal(hint.dropped, "complianse");
  assert.deepEqual(hint.products, [compliance]);
  assert.deepEqual(hint.products, filterProductsByQuery(products, "azure compliance"));
  // A swapped pair of letters in the first word, other words kept as typed.
  assert.equal(suggestProductQuery(products, "secruity Azure")?.query, "security Azure");
  // Two misspelled words are both corrected.
  const both = suggestProductQuery(products, "secruity complance");
  assert.equal(both?.query, "security compliance");
  assert.equal(both.dropped, "secruity complance");
  assert.deepEqual(both.products, [compliance]);
  // Junk that is no catalogue word one edit away still falls back to the drop.
  assert.equal(suggestProductQuery(products, "drawio zzz")?.query, "drawio");
  assert.equal(suggestProductQuery(products, "Security Azure zzqxnosuch")?.query, "Security Azure");
  assert.equal(suggestProductQuery(products, "zzqx yyqx"), null);
});

test("did-you-mean: a typo and a junk word together are corrected and dropped in one hint", () => {
  const { suggestProductQuery } = search;
  const compliance = products.find((p) => p.name === "Azure Compliance Matrix");
  assert.ok(compliance, "catalog has Azure Compliance Matrix");
  assert.deepEqual(filterProductsByQuery(products, "azure complianse zzqx"), []);
  const hint = suggestProductQuery(products, "azure complianse zzqx");
  assert.equal(hint?.query, "azure compliance");
  assert.equal(hint.dropped, "complianse zzqx");
  assert.deepEqual(hint.products, [compliance]);
  assert.deepEqual(hint.products, filterProductsByQuery(products, "azure compliance"));
  // The junk word can come first, and the corrected word is never the one dropped.
  assert.equal(suggestProductQuery(products, "zzqx azure complianse")?.query, "azure compliance");
  assert.equal(suggestProductQuery(products, "secruity complance zzqx")?.query, "security compliance");
  // Nonsense with no correctable word still finds nothing.
  assert.equal(suggestProductQuery(products, "zzqx no such product 7"), null);
});

test("product grid lists the did-you-mean products under an explicit hint", () => {
  const grid = readFileSync(resolve(root, "components/product-grid.tsx"), "utf8");
  assert.match(grid, /suggestProductQuery\(categoryProducts, query\)/);
  assert.match(grid, /const shownProducts = suggestion \? suggestion\.products : filteredProducts;/);
  assert.match(grid, /\{shownProducts\.map\(\(product, i\) => \(/);
  assert.match(grid, /Showing results for/);
  assert.match(grid, /data-testid="product-search-suggestion"[\s\S]*?onClick=\{\(\) => updateQuery\(suggestion\.query\)\}/);
});
