import Link from "next/link";
import { OutboundLink } from "@/components/outbound-link";
import { socialPlatforms } from "@/components/social-platforms";
import { navLinks, products, socialLinks } from "@/lib/site-data";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <Logo className="h-7 w-7" lit />
              <span className="text-base font-semibold tracking-tight">
                Lamplit Labs
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Small, practical software that illuminates the path forward.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Products</h4>
            <ul className="space-y-2">
              {products.map((product) => (
                <li key={product.name}>
                  <OutboundLink
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    trackingTarget={product.slug}
                    trackingContext="footer_product"
                    trackingUrl={product.url}
                  >
                    {product.name}
                  </OutboundLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Navigation</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Connect</h4>
            <div className="flex flex-wrap gap-2">
              {socialPlatforms.map(({ key, label, icon: Icon }) => (
                <OutboundLink
                  key={key}
                  href={socialLinks[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-lg border p-2 text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                  trackingTarget={key}
                  trackingContext="footer_social"
                  trackingUrl={socialLinks[key]}
                >
                  <Icon className="h-4 w-4" />
                </OutboundLink>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Lamplit Labs. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
