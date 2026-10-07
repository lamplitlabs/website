// Unit test for lib/copy-text.ts: the contact "Copy email address" button
// still copies when navigator.clipboard is undefined (non-secure contexts,
// older WebViews) by falling back to a hidden textarea + execCommand("copy").
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(fileURLToPath(import.meta.url), "..", "..");
const source = readFileSync(resolve(root, "lib/copy-text.ts"), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { copyText } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

const fakeDocument = ({ execResult = true } = {}) => {
  const body = { children: [], appendChild(n) { this.children.push(n); }, removeChild(n) { this.children = this.children.filter((c) => c !== n); } };
  const log = { selected: null, execCalls: 0 };
  return {
    body,
    log,
    createElement: () => ({ value: "", style: {}, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, select() { log.selected = this.value; } }),
    execCommand: (cmd) => { log.execCalls++; return cmd === "copy" && execResult; },
  };
};

test("copyText uses navigator.clipboard when available", async () => {
  let written = null;
  const nav = { clipboard: { writeText: async (t) => { written = t; } } };
  const doc = fakeDocument();
  assert.equal(await copyText("hello@lamplitlabs.com", nav, doc), true);
  assert.equal(written, "hello@lamplitlabs.com");
  assert.equal(doc.log.execCalls, 0);
});

test("copyText falls back to execCommand when navigator.clipboard is undefined", async () => {
  const doc = fakeDocument();
  assert.equal(await copyText("hello@lamplitlabs.com", {}, doc), true);
  assert.equal(doc.log.selected, "hello@lamplitlabs.com");
  assert.equal(doc.log.execCalls, 1);
  assert.equal(doc.body.children.length, 0, "hidden textarea is removed afterwards");
});

test("copyText falls back to execCommand when writeText rejects", async () => {
  const nav = { clipboard: { writeText: async () => { throw new Error("NotAllowedError"); } } };
  const doc = fakeDocument();
  assert.equal(await copyText("x", nav, doc), true);
  assert.equal(doc.log.execCalls, 1);
});

test("copyText reports failure when neither path is available", async () => {
  assert.equal(await copyText("x", {}, undefined), false);
  assert.equal(await copyText("x", {}, fakeDocument({ execResult: false })), false);
});
