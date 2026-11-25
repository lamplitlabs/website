import { getConsent } from "@/components/cookie-consent";

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, string> }) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

// Analytics scripts may be replaced by ad-blocker shims that stub
// `window.plausible` / `window.gtag` and throw when called. Tracking must never
// break the user action it decorates (e.g. an outbound "Visit site" click), so
// each provider call is isolated and failures are swallowed.
function safeCall(fn: () => void) {
  try {
    fn();
  } catch {
    // Analytics is best-effort; never let it interrupt the user's action.
  }
}

export function trackEvent(eventName: string, props?: Record<string, string>) {
  if (typeof window === "undefined") {
    return;
  }

  // Plausible (cookieless, always allowed)
  safeCall(() => window.plausible?.(eventName, props ? { props } : undefined));

  // Google Analytics 4 (only if user accepted cookies)
  safeCall(() => {
    if (getConsent() === "accepted") {
      window.gtag?.("event", eventName, props);
    }
  });
}

export function trackOutboundClick(target: string, context: string, url: string) {
  trackEvent("Outbound Click", {
    target,
    context,
    url,
  });
}
