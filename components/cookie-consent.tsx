"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { readConsent, writeConsent, type ConsentValue } from "@/lib/consent-storage";

export type { ConsentValue };

export function getConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  return readConsent(localStorage);
}

function setConsent(value: "accepted" | "declined") {
  writeConsent(localStorage, value);
  window.dispatchEvent(new Event("consent-change"));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getConsent();
    if (!existing) {
      setVisible(true);
    }
  }, []);

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
          You can accept or decline non-essential cookies.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
