"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

import { clearConsent, readConsent, writeConsent, type ConsentValue } from "@/lib/consent-storage";

export type { ConsentValue };

export function getConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  return readConsent(localStorage);
}

/** Persist the choice; returns false when storage refused the write. */
function setConsent(value: "accepted" | "declined"): boolean {
  const saved = writeConsent(localStorage, value);
  window.dispatchEvent(new Event("consent-change"));
  return saved;
}

export const CONSENT_SAVE_FAILED_NOTICE =
  "Your choice could not be saved this session \u2014 you may see this banner again.";

/** Forget the stored choice; the banner listens for the event and reappears. */
export function resetConsent() {
  clearConsent(localStorage);
  window.dispatchEvent(new Event("consent-change"));
}

/**
 * Footer control that lets a visitor who already accepted or declined
 * revisit the choice without clearing browser data.
 */
export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      data-testid="cookie-settings"
      onClick={resetConsent}
      className={className}
    >
      Cookie settings
    </button>
  );
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  // Set once when storage (e.g. private browsing) refused to persist the
  // choice, so the visitor learns why the banner may come back instead of it
  // silently reappearing. Cleared when the visitor dismisses the notice.
  const [saveFailed, setSaveFailed] = useState(false);
  const acceptRef = useRef<HTMLButtonElement>(null);
  // True only when the banner reappears after a reset, so initial page load
  // never steals focus but a "Cookie settings" click moves keyboard and
  // screen-reader users from the footer into the reopened banner.
  const reopenedRef = useRef(false);

  useEffect(() => {
    function sync(event?: Event) {
      const open = getConsent() === null;
      if (open && event) reopenedRef.current = true;
      setVisible(open);
    }

    sync();
    // Re-shown when the footer's "Cookie settings" control clears the choice.
    window.addEventListener("consent-change", sync);
    return () => window.removeEventListener("consent-change", sync);
  }, []);

  useEffect(() => {
    if (visible && reopenedRef.current) {
      reopenedRef.current = false;
      acceptRef.current?.focus();
    }
  }, [visible]);

  function choose(value: "accepted" | "declined") {
    if (!setConsent(value)) setSaveFailed(true);
    setVisible(false);
  }

  function handleAccept() {
    choose("accepted");
  }

  function handleDecline() {
    choose("declined");
  }

  if (!visible) {
    if (!saveFailed) return null;
    return (
      <div
        role="status"
        data-testid="cookie-consent-save-failed"
        className="fixed bottom-0 left-0 right-0 z-[60] border-t bg-background/95 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <p className="text-sm text-muted-foreground">{CONSENT_SAVE_FAILED_NOTICE}</p>
          <Button variant="outline" size="sm" onClick={() => setSaveFailed(false)}>
            Dismiss
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      aria-describedby="cookie-consent-description"
      className="fixed bottom-0 left-0 right-0 z-[60] border-t bg-background/95 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="cookie-consent-description" className="text-sm text-muted-foreground">
          We use cookies for analytics to understand how you use our site.
          You can accept or decline non-essential cookies.{" "}
          <Link
            href="/privacy"
            data-testid="cookie-consent-privacy-link"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            What we collect and why
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button ref={acceptRef} size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
