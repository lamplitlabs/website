// Unit test for productNotifyMeHref in lib/site-data.ts: the "Notify me"
// mailto link on in-development product pages must percent-encode the
// subject so product names with `&`, `?`, `#`, `+` or non-ASCII characters
// are not truncated or misread as extra mailto query parameters.
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
const { productNotifyMeHref, contactEmail, products } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

const subjectOf = (href) => {
  const url = new URL(href);
  assert.equal(url.protocol, "mailto:");
  return url.searchParams;
};

test("plain product name produces a single encoded subject", () => {
  const href = productNotifyMeHref({ name: "Tulsa Traffic" });
  assert.equal(href, `mailto:${contactEmail}?subject=Notify%20me%3A%20Tulsa%20Traffic`);
  assert.equal(subjectOf(href).get("subject"), "Notify me: Tulsa Traffic");
});

for (const name of ["Q&A Builder", "Why? Tracker", "Notes #1 + Sync", "Café Météo 日本語", "100% done"]) {
  test(`product name ${JSON.stringify(name)} round-trips through the mailto subject`, () => {
    const href = productNotifyMeHref({ name });
    const params = subjectOf(href);
    assert.equal(params.get("subject"), `Notify me: ${name}`);
    assert.deepEqual([...params.keys()], ["subject"], "no stray query parameters");
    const query = href.slice(href.indexOf("?") + 1);
    assert.doesNotMatch(query.slice("subject=".length), /[&?#+\s]|[^\x20-\x7e]/, "subject value fully percent-encoded");
  });
}

test("real catalog products all produce a parseable subject", () => {
  for (const product of products) {
    assert.equal(subjectOf(productNotifyMeHref(product)).get("subject"), `Notify me: ${product.name}`);
  }
});
