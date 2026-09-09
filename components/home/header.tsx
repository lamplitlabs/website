"use client";

import Link from "next/link";
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
  return (
    <header
      className={`fixed top-0 z-50 w-full overflow-visible transition-all duration-300 ${
        scrolled
          ? "border-b bg-background/70 shadow-sm backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between overflow-visible px-4">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Logo className="h-8 w-8" lit={theme !== "dark"} />
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
                className={`relative rounded-md px-3 py-2 text-sm transition-colors after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:bg-foreground after:transition-all after:duration-300 ${
                  isActive
                    ? "text-foreground after:left-1 after:w-[calc(100%-8px)]"
                    : "text-muted-foreground hover:text-foreground after:w-0 hover:after:left-1 hover:after:w-[calc(100%-8px)]"
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <div className="ml-2">
            <LampToggle theme={theme} setTheme={setTheme} />
          </div>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LampToggle theme={theme} setTheme={setTheme} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
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
        <nav className="mobile-menu-enter border-t bg-background/95 px-4 pb-4 pt-2 backdrop-blur-xl md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="block rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
