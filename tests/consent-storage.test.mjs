// Unit test for lib/consent-storage.ts: the consent key is branded for Lamplit
// Labs and a choice stored under the legacy "bib-" key is migrated, never reset.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(fileURLToPath(import.meta.url), "..", "..");
const source = readFileSync(resolve(root, "lib/consent-storage.ts"), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { CONSENT_KEY, LEGACY_CONSENT_KEY, readConsent, writeConsent, clearConsent } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

const memoryStorage = (init = {}) => {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    entries: () => Object.fromEntries(m),
  };
};

test("consent key is branded for Lamplit Labs, not the leftover bib- prefix", () => {
  assert.equal(CONSENT_KEY, "lamplit-cookie-consent");
  assert.equal(LEGACY_CONSENT_KEY, "bib-cookie-consent");
  assert.notEqual(CONSENT_KEY, LEGACY_CONSENT_KEY);
});

test("an existing choice under the legacy key survives the rename", () => {
  for (const choice of ["accepted", "declined"]) {
    const s = memoryStorage({ [LEGACY_CONSENT_KEY]: choice });
    assert.equal(readConsent(s), choice, `legacy ${choice} must be honoured`);
    assert.deepEqual(s.entries(), { [CONSENT_KEY]: choice }, "migrated to new key only");
    assert.equal(readConsent(s), choice, "stable after migration");
  }
});

test("no choice yields null and garbage values are ignored", () => {
  assert.equal(readConsent(memoryStorage()), null);
  assert.equal(readConsent(memoryStorage({ [LEGACY_CONSENT_KEY]: "yes" })), null);
  assert.equal(readConsent(memoryStorage({ [CONSENT_KEY]: "maybe" })), null);
});

test("writeConsent stores under the new key and clears the legacy one", () => {
  const s = memoryStorage({ [LEGACY_CONSENT_KEY]: "declined" });
  writeConsent(s, "accepted");
  assert.deepEqual(s.entries(), { [CONSENT_KEY]: "accepted" });
});

// Consent reset (cinder-2): a visitor who accepted or declined can change
// their mind from the site itself, not only via browser settings.
test("clearConsent forgets the stored choice so the banner asks again", () => {
  for (const choice of ["accepted", "declined"]) {
    const s = memoryStorage({ [CONSENT_KEY]: choice, [LEGACY_CONSENT_KEY]: choice });
    clearConsent(s);
    assert.equal(readConsent(s), null, `${choice} must be forgotten`);
    assert.deepEqual(s.entries(), {}, "no consent keys remain");
  }
});

test("footer exposes a consent-reset action that reopens the banner", () => {
  const footer = readFileSync(resolve(root, "components/home/footer.tsx"), "utf8");
  assert.match(footer, /CookieSettingsButton/, "footer must render the Cookie settings control");
  const banner = readFileSync(resolve(root, "components/cookie-consent.tsx"), "utf8");
  assert.match(banner, /data-testid="cookie-settings"/, "control must be identifiable");
  assert.match(banner, /clearConsent\(/, "control must clear the stored consent");
  assert.match(banner, /addEventListener\("consent-change"/, "banner must reappear on reset");
  const privacy = readFileSync(resolve(root, "app/privacy/page.tsx"), "utf8");
  assert.doesNotMatch(privacy, /browser settings/, "privacy page must no longer send users to browser settings");
});
