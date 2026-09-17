import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";
import { SiteNav } from "@/components/site-nav";
import { navLinks } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you requested could not be found on Lamplit Labs.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
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

      <main className="mx-auto flex min-h-[70vh] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center">
        <Logo className="mb-6 h-16 w-16" />
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
          404
        </p>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">Page not found</h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          The page you are looking for does not exist or has moved. Head back
          to the Lamplit Labs home page to explore our products.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </main>
    </>
  );
}
