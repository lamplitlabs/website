import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { Footer } from "@/components/home/footer";
import { contactEmail, navLinks } from "@/lib/site-data";
import { CONSENT_KEY } from "@/lib/consent-storage";

export const metadata: Metadata = {
  title: "Privacy & Cookies",
  description:
    "What Lamplit Labs collects when you visit lamplitlabs.com, which analytics run, and how the cookie choice is stored.",
  alternates: { canonical: "https://www.lamplitlabs.com/privacy" },
};

// Plain-language explanation of the analytics the site actually runs. Keep
// this page in step with app/layout.tsx (Plausible), components/google-analytics.tsx
// (GA4 behind consent) and lib/consent-storage.ts (where the choice is kept).
export default function PrivacyPage() {
  return (
    <>
      <SiteNav>
        <ul className="flex items-center gap-4 text-sm text-muted-foreground">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.external ? link.href : `/${link.href}`}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noopener noreferrer" : undefined}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </SiteNav>

      <main className="mx-auto max-w-3xl px-4 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to home
        </Link>

        <p className="mono-label mb-2 text-primary">Privacy &amp; cookies</p>
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          What this site collects, and why
        </h1>
        <p className="mb-10 text-muted-foreground">
          lamplitlabs.com is a static website. It has no accounts, no forms and
          no payments, so the only data it handles is anonymous usage
          analytics. This page explains exactly what runs and what the cookie
          banner controls.
        </p>

        <section className="space-y-10 text-sm leading-relaxed sm:text-base">
          <div>
            <h2 className="mb-2 text-xl font-semibold">Always on: cookieless page counts</h2>
            <p className="text-muted-foreground">
              Every page view is counted with{" "}
              <a
                href="https://plausible.io/data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Plausible Analytics
              </a>
              . Plausible sets no cookies, stores no persistent identifier and
              reports only aggregate numbers (pages visited, referrer, country,
              device type). Because nothing is stored on your device, this
              does not need your consent and runs whether you accept or
              decline the banner.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">Only if you accept: Google Analytics</h2>
            <p className="text-muted-foreground">
              If you click <strong>Accept</strong> on the cookie banner, the
              site also loads Google Analytics 4. Google Analytics uses
              cookies to recognise returning visits and to measure which
              products and outbound links get used, which helps us decide what
              to build next. If you click <strong>Decline</strong>, or do not
              answer, Google Analytics is never loaded and no analytics cookie
              is set.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">How your choice is remembered</h2>
            <p className="text-muted-foreground">
              Your Accept or Decline choice is saved in your browser&apos;s
              local storage under the key <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{CONSENT_KEY}</code>{" "}
              so the banner does not reappear on every page. Nothing else is
              stored there and it is never sent to us. To change your mind,
              use the <strong>Cookie settings</strong> link in the footer: it
              forgets your choice and shows the banner again right away.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">Links to other sites</h2>
            <p className="text-muted-foreground">
              Our products run on their own domains and have their own privacy
              terms. Links to them, and to GitHub or social profiles, open
              those third-party sites, which this page does not cover.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">Questions</h2>
            <p className="text-muted-foreground">
              Ask us at{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {contactEmail}
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
