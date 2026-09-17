import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

interface SiteNavProps {
  /** Right-hand slot (page-specific CTA or links). */
  children?: ReactNode;
}

/**
 * Minimal sticky nav bar shared by the product pages and the 404 page,
 * so both render identical branding/back-home markup from one source.
 */
export function SiteNav({ children }: SiteNavProps) {
  return (
    <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          aria-label="Back to Lamplit Labs home"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <Logo className="h-6 w-6" />
          <span className="hidden sm:inline">Lamplit Labs</span>
        </Link>
        {children}
      </div>
    </nav>
  );
}
