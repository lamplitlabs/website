// Cookie-consent persistence (no React, so it can be unit-tested directly).
// The key is branded for Lamplit Labs; the legacy key is read once so a visitor
// who already accepted or declined before the rename keeps that choice.
export const CONSENT_KEY = "lamplit-cookie-consent";
export const LEGACY_CONSENT_KEY = "bib-cookie-consent";

export type ConsentValue = "accepted" | "declined" | null;

function parse(value: string | null): ConsentValue {
  return value === "accepted" || value === "declined" ? value : null;
}

// Some browsers (Safari private mode, cookies disabled, storage quota
// exceeded) throw on getItem/setItem/removeItem instead of failing quietly.
// A thrown error here must not crash the banner or the rest of the page, so
// every storage call is guarded; a failure is treated as "no stored choice".
export function readConsent(storage: Storage): ConsentValue {
  let current: ConsentValue = null;
  try {
    current = parse(storage.getItem(CONSENT_KEY));
  } catch {
    return null;
  }
  if (current) return current;

  let legacy: ConsentValue = null;
  try {
    legacy = parse(storage.getItem(LEGACY_CONSENT_KEY));
  } catch {
    return null;
  }
  if (legacy) {
    // One-time migration: copy forward and drop the old key.
    try {
      storage.setItem(CONSENT_KEY, legacy);
      storage.removeItem(LEGACY_CONSENT_KEY);
    } catch {
      // Migration is best-effort; the legacy value still applies this visit.
    }
  }
  return legacy;
}

// Returns true when the choice was persisted, false when storage refused the
// write so the caller can tell the visitor the banner may reappear.
export function writeConsent(storage: Storage, value: "accepted" | "declined"): boolean {
  try {
    storage.setItem(CONSENT_KEY, value);
  } catch {
    // Storage is unavailable (e.g. private mode); the choice still applies
    // for this page view even though it will not persist.
    return false;
  }
  try {
    storage.removeItem(LEGACY_CONSENT_KEY);
  } catch {
    // The new key was written; failing to drop the legacy key is harmless.
  }
  return true;
}

// Forget the stored choice so the banner asks again. Used by the footer's
// "Cookie settings" control so a visitor can change their mind on the site
// itself instead of clearing site data in browser settings.
export function clearConsent(storage: Storage) {
  try {
    storage.removeItem(CONSENT_KEY);
    storage.removeItem(LEGACY_CONSENT_KEY);
  } catch {
    // Nothing to do if storage itself refuses the call.
  }
}
