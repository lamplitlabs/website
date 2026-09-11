"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LampToggle } from "@/components/lamp-toggle";
import { Logo } from "@/components/logo";
import { navLinks } from "@/lib/site-data";

interface HeaderProps {
  scrolled: boolean;
  activeSection: string;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  theme: string | undefined;
  setTheme: (theme: string) => void;
}

export function Header({
  scrolled,
  activeSection,
  mobileMenuOpen,
  setMobileMenuOpen,
  theme,
  setTheme,
}: HeaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayTheme = mounted ? theme : "dark";

  return (
    <header
      className={`site-header fixed inset-x-3 top-3 z-50 mx-auto max-w-6xl overflow-visible rounded-2xl border backdrop-blur-xl sm:inset-x-5 ${
        scrolled ? "site-header-scrolled" : ""
      }`}
    >
      <div className="flex h-14 items-center justify-between overflow-visible px-4 sm:px-5">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Logo className="h-8 w-8" lit={displayTheme !== "dark"} />
          <span className="text-lg font-semibold tracking-tight">Lamplit Labs</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = !link.external && link.href === `#${activeSection}`;

            return (
              <a
                key={link.label}
                href={link.href}
                aria-current={isActive ? "location" : undefined}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={`relative rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:bg-primary after:transition-all after:duration-300 ${
                  isActive
                    ? "text-foreground after:left-1 after:w-[calc(100%-8px)]"
                    : "text-muted-foreground hover:text-foreground after:w-0 hover:after:left-1 hover:after:w-[calc(100%-8px)]"
                }`}
              >
                {link.label}
                {link.label === "AI" && (
                  <span
                    aria-hidden
                    className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle"
                  />
                )}
              </a>
            );
          })}
          <div className="ml-2">
            <LampToggle theme={displayTheme} setTheme={setTheme} />
          </div>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LampToggle theme={displayTheme} setTheme={setTheme} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="mobile-menu-enter rounded-b-2xl border-t border-border/60 bg-background/95 px-4 pb-5 pt-3 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="block rounded-md px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {link.label}
              {link.label === "AI" && (
                <span
                  aria-hidden
                  className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle"
                />
              )}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
