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
  assert.match(banner, /ref=\{acceptRef\}/, "Accept button must carry the focus ref");
  assert.match(banner, /acceptRef\.current\?\.focus\(\)/, "reopened banner must move focus to Accept");
  const privacy = readFileSync(resolve(root, "app/privacy/page.tsx"), "utf8");
  assert.doesNotMatch(privacy, /browser settings/, "privacy page must no longer send users to browser settings");
});

test("banner is announced to screen readers as a labelled dialog", () => {
  const banner = readFileSync(resolve(root, "components/cookie-consent.tsx"), "utf8");
  assert.match(banner, /role="dialog"/, "banner wrapper must be a dialog region");
  assert.match(banner, /aria-label="Cookie preferences"/, "dialog must carry an accessible name");
});

test("dialog is described by its explanatory paragraph so screen readers hear why cookies are used", () => {
  const banner = readFileSync(resolve(root, "components/cookie-consent.tsx"), "utf8");
  assert.match(banner, /aria-describedby="cookie-consent-description"/, "dialog must point at its description");
  assert.match(banner, /<p id="cookie-consent-description"/, "explanatory paragraph must carry the matching id");
});

// Private-mode Safari and storage-disabled browsers can throw on getItem/
// setItem/removeItem instead of failing quietly; the banner must not crash.
test("a storage that throws on every call degrades to no stored choice, not a crash", () => {
  const throwingStorage = {
    getItem: () => {
      throw new Error("SecurityError: storage disabled");
    },
    setItem: () => {
      throw new Error("SecurityError: storage disabled");
    },
    removeItem: () => {
      throw new Error("SecurityError: storage disabled");
    },
  };
  assert.doesNotThrow(() => readConsent(throwingStorage));
  assert.equal(readConsent(throwingStorage), null);
  assert.doesNotThrow(() => writeConsent(throwingStorage, "accepted"));
  assert.doesNotThrow(() => clearConsent(throwingStorage));
});

// Fallback notice (ripple): when storage refuses the write, writeConsent reports
// it so components/cookie-consent.tsx can show the visitor an inline notice
// instead of the banner silently reappearing on the next page view.
test("writeConsent reports whether the choice was persisted", () => {
  assert.equal(writeConsent(memoryStorage(), "accepted"), true, "persisted write returns true");
  const throwingStorage = {
    getItem: () => null,
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
    removeItem: () => {},
  };
  assert.equal(writeConsent(throwingStorage, "declined"), false, "failed write returns false");
});

test("cookie banner renders a one-time notice when the consent write fails", () => {
  const component = readFileSync(resolve(root, "components/cookie-consent.tsx"), "utf8");
  assert.match(
    component,
    /CONSENT_SAVE_FAILED_NOTICE =\s*"Your choice could not be saved this session/,
    "notice copy explains the banner may come back",
  );
  assert.match(component, /setFailedChoice\(value\);\s*setSaveFailed\(true\)/, "state set on failed write");
  assert.match(component, /data-testid="cookie-consent-save-failed"/, "notice rendered inline");
  assert.match(component, /role="status"/, "notice announced to assistive tech");
});

test("a write that failed can be retried once storage recovers", () => {
  let broken = true;
  const s = memoryStorage();
  const flaky = { ...s, setItem: (k, v) => { if (broken) throw new Error("quota"); s.setItem(k, v); } };
  assert.equal(writeConsent(flaky, "declined"), false, "first write refused");
  assert.equal(readConsent(flaky), null, "nothing persisted yet");
  broken = false;
  assert.equal(writeConsent(flaky, "declined"), true, "retry succeeds");
  assert.equal(readConsent(flaky), "declined", "retried choice persists");
});

// Self-clearing notice (pallas-2): the "could not be saved" notice must not
// stay stale once storage recovers; the banner re-probes storage on the
// notice's mount and when the visitor returns to the tab, with no click.
test("save-failed notice re-probes storage automatically so it self-clears when storage recovers", () => {
  const component = readFileSync(resolve(root, "components/cookie-consent.tsx"), "utf8");
  const effect = component.match(/useEffect\(\(\) => \{\s*if \(!saveFailed\) return;[\s\S]*?\}, \[saveFailed, failedChoice\]\);/);
  assert.ok(effect, "an effect keyed on saveFailed must re-probe storage");
  assert.match(effect[0], /writeConsent\(localStorage, failedChoice\)/, "re-probe retries the same choice");
  assert.match(effect[0], /setSaveFailed\(false\)/, "notice clears itself on success");
  assert.match(effect[0], /reprobe\(\);\s*window\.addEventListener\("focus", reprobe\)/, "probes once on mount and again on focus");
  assert.match(effect[0], /addEventListener\("visibilitychange", reprobe\)/, "probes when the tab becomes visible again");
  assert.match(effect[0], /removeEventListener\("focus", reprobe\)/, "listeners are removed on cleanup");
});
