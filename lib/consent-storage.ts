// Cookie-consent persistence (no React, so it can be unit-tested directly).
// The key is branded for Lamplit Labs; the legacy key is read once so a visitor
// who already accepted or declined before the rename keeps that choice.
export const CONSENT_KEY = "lamplit-cookie-consent";
export const LEGACY_CONSENT_KEY = "bib-cookie-consent";

export type ConsentValue = "accepted" | "declined" | null;

function parse(value: string | null): ConsentValue {
  return value === "accepted" || value === "declined" ? value : null;
}

export function readConsent(storage: Storage): ConsentValue {
  const current = parse(storage.getItem(CONSENT_KEY));
  if (current) return current;
  const legacy = parse(storage.getItem(LEGACY_CONSENT_KEY));
  if (legacy) {
    // One-time migration: copy forward and drop the old key.
    storage.setItem(CONSENT_KEY, legacy);
    storage.removeItem(LEGACY_CONSENT_KEY);
  }
  return legacy;
}

export function writeConsent(storage: Storage, value: "accepted" | "declined") {
  storage.setItem(CONSENT_KEY, value);
  storage.removeItem(LEGACY_CONSENT_KEY);
}

// Forget the stored choice so the banner asks again. Used by the footer's
// "Cookie settings" control so a visitor can change their mind on the site
// itself instead of clearing site data in browser settings.
export function clearConsent(storage: Storage) {
  storage.removeItem(CONSENT_KEY);
  storage.removeItem(LEGACY_CONSENT_KEY);
}
