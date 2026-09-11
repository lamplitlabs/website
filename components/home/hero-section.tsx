import { ArrowDown, ArrowRight } from "lucide-react";
import { HeroGlobe } from "@/components/hero-globe";
import { SocialBar } from "@/components/social-bar";
import { socialLinks } from "@/lib/site-data";
import styles from "./hero-scene.module.css";

export function HeroSection() {
  return (
    <section className="hero-lamplight relative isolate overflow-hidden px-4 pb-8 pt-28 sm:px-6 sm:pt-32 lg:flex lg:min-h-screen lg:flex-col lg:justify-center lg:px-8">
      <div aria-hidden className="hero-grain absolute inset-0" />

      <div className={`${styles.layout} relative mx-auto w-full max-w-7xl`}>
        <div className={`${styles.copy} relative z-10 text-center lg:text-left`}>
          <a
            href="#ai"
            className="hero-entrance hero-entrance-1 eyebrow-shimmer glass group relative isolate inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span>New &middot; Lamplit Light</span>
            <span className="hidden text-muted-foreground sm:inline">
              AI that runs where you are
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform motion-safe:group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>

          <h1 className="hero-entrance hero-entrance-2 mt-7 text-balance font-display text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-[clamp(3.4rem,5.6vw,5.25rem)]">
            Practical tools for{" "}
            <span className="lamplit-text">real problems</span>
          </h1>

          <p className="hero-entrance hero-entrance-3 mx-auto mt-6 max-w-xl text-balance text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 lg:mx-0 lg:text-[1.0625rem] lg:leading-7">
            From the visual AI agent builder Amistio and our AI lab Lamplit Light
            to medical exam prep, citizenship tools, career resources, developer
            utilities, and compliance &mdash; we build practical software that
            makes a real difference.
          </p>

          <div className="hero-entrance hero-entrance-4 mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <a
              href="#products"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[0_8px_30px_-10px_hsl(var(--glow)/0.6)] transition-all hover:shadow-[0_14px_38px_-12px_hsl(var(--glow)/0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:hover:-translate-y-0.5"
            >
              Explore products
            </a>
            <a
              href="#our-story"
              className="glass inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:hover:-translate-y-0.5"
            >
              Our story
            </a>
            <a
              href="#ai"
              className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Meet Lamplit Light
              <ArrowRight
                className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5"
                aria-hidden
              />
            </a>
          </div>
        </div>

        <HeroGlobe className={styles.visual} />

        <div className={styles.details}>
          <div className="hero-entrance hero-entrance-4 flex justify-center lg:justify-start">
            <SocialBar links={socialLinks} context="hero_social" />
          </div>

          <div className="hero-entrance hero-entrance-5 mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-muted-foreground/70 lg:justify-start">
            <span className="mono-label">built in Germany</span>
            <span aria-hidden className="text-primary/60">
              &middot;
            </span>
            <span className="mono-label">used worldwide</span>
            <span aria-hidden className="text-primary/60">
              &middot;
            </span>
            <span className="mono-label">free where possible</span>
          </div>
        </div>
      </div>

      <div className="hero-entrance hero-entrance-5 relative mt-8 flex justify-center lg:mt-10">
        <a
          href="#our-story"
          aria-label="Read our story"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:animate-bounce"
        >
          <ArrowDown className="h-5 w-5" aria-hidden />
        </a>
      </div>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
    </section>
  );
}
