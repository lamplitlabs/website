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

function setConsent(value: "accepted" | "declined") {
  writeConsent(localStorage, value);
  window.dispatchEvent(new Event("consent-change"));
}

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

  function handleAccept() {
    setConsent("accepted");
    setVisible(false);
  }

  function handleDecline() {
    setConsent("declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
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
