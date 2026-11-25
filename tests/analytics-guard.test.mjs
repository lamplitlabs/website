// Unit test for lib/analytics.ts: ad-blocker shims that stub window.gtag /
// window.plausible and throw must not break the outbound "Visit site" click
// handler in components/outbound-link.tsx, and one provider failing must not
// prevent the other from being called.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(fileURLToPath(import.meta.url), "..", "..");
const source = readFileSync(resolve(root, "lib/analytics.ts"), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
// Stub the consent module: globalThis.__consent controls what getConsent() returns.
const stub = "data:text/javascript," + encodeURIComponent("export const getConsent = () => globalThis.__consent;");
const js = outputText.replace(/from\s+["']@\/components\/cookie-consent["']/, `from ${JSON.stringify(stub)}`);
assert.notEqual(js, outputText, "cookie-consent import was rewritten");
const { trackEvent, trackOutboundClick } = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString("base64")}`
);

beforeEach(() => {
  globalThis.window = {};
  globalThis.__consent = "accepted";
});

test("throwing window.gtag does not break trackOutboundClick", () => {
  const plausibleCalls = [];
  window.plausible = (...args) => plausibleCalls.push(args);
  window.gtag = () => {
    throw new Error("blocked by ad-blocker shim");
  };
  assert.doesNotThrow(() => trackOutboundClick("Tulsa Traffic", "product-card", "https://example.com"));
  assert.equal(plausibleCalls.length, 1);
  assert.equal(plausibleCalls[0][0], "Outbound Click");
  assert.deepEqual(plausibleCalls[0][1], {
    props: { target: "Tulsa Traffic", context: "product-card", url: "https://example.com" },
  });
});

test("throwing window.plausible still reports to gtag when consent accepted", () => {
  const gtagCalls = [];
  window.plausible = () => {
    throw new Error("blocked");
  };
  window.gtag = (...args) => gtagCalls.push(args);
  assert.doesNotThrow(() => trackEvent("Outbound Click", { target: "x" }));
  assert.deepEqual(gtagCalls, [["event", "Outbound Click", { target: "x" }]]);
});

test("both providers throwing is swallowed", () => {
  window.plausible = () => {
    throw new Error("blocked");
  };
  window.gtag = () => {
    throw new Error("blocked");
  };
  assert.doesNotThrow(() => trackOutboundClick("a", "b", "https://c"));
});

test("gtag is not called without consent, and missing providers are a no-op", () => {
  globalThis.__consent = null;
  const gtagCalls = [];
  window.gtag = (...args) => gtagCalls.push(args);
  assert.doesNotThrow(() => trackEvent("Outbound Click"));
  assert.equal(gtagCalls.length, 0);
  globalThis.window = {};
  assert.doesNotThrow(() => trackEvent("Outbound Click"));
});
