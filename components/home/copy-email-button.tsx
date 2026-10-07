"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Copy-to-clipboard fallback next to the mailto contact link, for visitors
 * whose device has no configured mail client (a mailto: click would do
 * nothing or open an unwanted app). Falls back to selecting nothing and
 * leaving the address visible if the Clipboard API is unavailable.
 */
export function CopyEmailButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  };

  const label =
    state === "copied"
      ? "Copied!"
      : state === "failed"
        ? "Copy failed — select the address above"
        : "Copy email address";

  return (
    <button
      type="button"
      onClick={handleCopy}
      data-testid="contact-copy-email"
      aria-label={`Copy ${email} to clipboard`}
      className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
    >
      {state === "copied" ? (
        <Check className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Copy className="h-4 w-4" aria-hidden="true" />
      )}
      <span aria-live="polite">{label}</span>
    </button>
  );
}
