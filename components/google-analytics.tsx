"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { getConsent } from "@/components/cookie-consent";

const GA_ID = "G-F9EC1KWJNY";

export function GoogleAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function check() {
      setAllowed(getConsent() === "accepted");
    }

    check();
    window.addEventListener("consent-change", check);
    return () => window.removeEventListener("consent-change", check);
  }, []);

  if (!allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
