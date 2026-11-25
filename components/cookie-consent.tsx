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
  // The choice whose write failed, kept so "Try again" can retry the exact
  // same write (e.g. after the visitor frees storage or leaves private mode).
  const [failedChoice, setFailedChoice] = useState<"accepted" | "declined">("accepted");
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

  // While the notice is up, re-probe storage without a click: once when the
  // notice mounts and again whenever the visitor returns to the tab (focus or
  // visibility), since that is when storage most often recovers (private
  // window closed, quota freed). On success the notice clears itself.
  useEffect(() => {
    if (!saveFailed) return;
    function reprobe() {
      if (document.visibilityState === "hidden") return;
      if (writeConsent(localStorage, failedChoice)) {
        setSaveFailed(false);
        window.dispatchEvent(new Event("consent-change"));
      }
    }
    reprobe();
    window.addEventListener("focus", reprobe);
    document.addEventListener("visibilitychange", reprobe);
    return () => {
      window.removeEventListener("focus", reprobe);
      document.removeEventListener("visibilitychange", reprobe);
    };
  }, [saveFailed, failedChoice]);

  function choose(value: "accepted" | "declined") {
    if (setConsent(value)) {
      setSaveFailed(false);
    } else {
      setFailedChoice(value);
      setSaveFailed(true);
    }
    setVisible(false);
  }

  // Retry the failed write with the same choice; on success the notice clears.
  function retrySave() {
    choose(failedChoice);
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
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => setSaveFailed(false)}>
              Dismiss
            </Button>
            <Button size="sm" data-testid="cookie-consent-retry-save" onClick={retrySave}>
              Try again
            </Button>
          </div>
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
