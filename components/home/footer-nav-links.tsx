"use client";

import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/site-data";

// Footer navigation. Products/AI/About/Contact are hash anchors into the home
// page's sections. On any other route (e.g. /privacy, /products/<slug>) there
// is no matching id= target, so a plain "#products" would be a dead click;
// prefix with "/" there so the link navigates home and then scrolls.
export function FooterNavLinks() {
  const pathname = usePathname();
  const onHome = pathname === "/" || pathname === null;
  return (
    <ul className="space-y-2">
      {navLinks.map((link) => {
        const href =
          !link.external && link.href.startsWith("#") && !onHome
            ? `/${link.href}`
            : link.href;
        return (
          <li key={link.label}>
            <a
              href={href}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
