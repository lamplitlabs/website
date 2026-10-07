"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyText } from "@/lib/copy-text";

/**
 * Copy-to-clipboard fallback next to the mailto contact link, for visitors
 * whose device has no configured mail client (a mailto: click would do
 * nothing or open an unwanted app). Uses the Clipboard API when present and
 * falls back to a hidden textarea + execCommand("copy") where it is not
 * (non-secure contexts, older WebViews), so more devices copy instead of
 * seeing the failure message.
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
    const ok = await copyText(email);
    setState(ok ? "copied" : "failed");
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
