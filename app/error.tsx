"use client";

import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Logo } from "@/components/logo";
import { SiteNav } from "@/components/site-nav";
import { navLinks } from "@/lib/site-data";

// Route-level error boundary (Next.js App Router convention). When a page
// throws while rendering, this replaces Next's unstyled default crash screen
// with a page that matches the rest of the site and offers a way to recover.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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

      <main
        id="main-content"
        className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center"
      >
        <Logo className="mb-6 h-16 w-16" />
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
          Error
        </p>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Something went wrong</h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          Sorry, this page could not be displayed. You can try loading it
          again, or head back to the Lamplit Labs home page.
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
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </main>
    </>
  );
}
