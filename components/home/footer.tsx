import Link from "next/link";
import { OutboundLink } from "@/components/outbound-link";
import { socialPlatforms } from "@/components/social-platforms";
import {
  getProductBySlug,
  isProductInDevelopment,
  isProductLive,
  navLinks,
  products,
  socialLinks,
} from "@/lib/site-data";
import { Logo } from "@/components/logo";
import { CookieSettingsButton } from "@/components/cookie-consent";

export function Footer() {
  // The AI domain is only advertised in the footer once Lamplit Light is Live;
  // while In development the AI section alone carries the "coming to" copy.
  // The hostname is derived from the product's url in lib/site-data so the
  // footer never carries its own copy of the AI domain.
  const light = getProductBySlug("light");
  const showAiDomain = light ? isProductLive(light) : false;
  const aiDomain = light ? new URL(light.url).hostname : null;
  return (
    <footer>
      <div
        aria-hidden="true"
        className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />
      <div className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <Logo className="h-7 w-7" lit />
              <span className="text-base font-semibold tracking-tight">
                Lamplit Labs
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Practical tools and AI you can run where you are - small software
              that illuminates the path forward.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Products</h4>
            <ul className="space-y-2">
              {products.map((product) => {
                const label = (
                  <>
                    {product.name}
                    {isProductInDevelopment(product) && (
                      <span
                        aria-hidden="true"
                        className="mono-label ml-2 align-middle text-primary/80"
                      >
                        soon
                      </span>
                    )}
                  </>
                );
                const className =
                  "text-sm text-muted-foreground transition-colors hover:text-foreground";
                // Only a live product links out to its own site from the
                // footer. A product still in development points at its
                // internal /products/<slug> page instead, so a not-yet-public
                // domain is never linked site-wide.
                return (
                  <li key={product.name}>
                    {isProductLive(product) ? (
                      <OutboundLink
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={className}
                        trackingTarget={product.slug}
                        trackingContext="footer_product"
                        trackingUrl={product.url}
                      >
                        {label}
                      </OutboundLink>
                    ) : (
                      <Link href={`/products/${product.slug}`} className={className}>
                        {label}
                      </Link>
                    )}
                  </li>
                );
              })}
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
          <p>
            &copy; {new Date().getFullYear()} Lamplit Labs. All rights reserved.
            {" "}&middot;{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Privacy &amp; cookies
            </Link>
            {" "}&middot;{" "}
            <CookieSettingsButton className="underline underline-offset-4 transition-colors hover:text-foreground" />
          </p>
          <p className="mono-label mt-3 text-muted-foreground/60">
            lamplitlabs.com
            {showAiDomain && aiDomain && <> &middot; {aiDomain}</>}
          </p>
        </div>
      </div>
    </footer>
  );
}
