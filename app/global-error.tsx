"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import "./globals.css";

// Root error boundary (Next.js App Router convention). app/error.tsx only
// catches errors thrown below the root layout; if app/layout.tsx itself fails
// to render, Next falls back to its default unstyled crash screen. This file
// replaces that fallback with a branded recovery page. Because it replaces the
// root layout it must render its own <html> and <body> and must not depend on
// providers from the layout, so it sets the dark theme class itself.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <main
          id="main-content"
          className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-20 text-center"
        >
          <Logo className="mb-6 h-16 w-16" />
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
            Error
          </p>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Something went wrong</h1>
          <p className="mb-8 max-w-md text-muted-foreground">
            Sorry, Lamplit Labs could not be displayed right now. You can try
            loading it again, or head back to the home page.
          </p>
          {error.digest && (
            <p className="mb-8 text-xs text-muted-foreground" data-testid="error-digest">
              Reference: {error.digest}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Back to home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
