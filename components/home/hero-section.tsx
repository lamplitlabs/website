import { ArrowDown, ArrowRight } from "lucide-react";
import { HeroGlobe } from "@/components/hero-globe";
import { SocialBar } from "@/components/social-bar";
import { socialLinks } from "@/lib/site-data";

export function HeroSection() {
  return (
    <section className="hero-lamplight relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-14">
      <div aria-hidden className="hero-grain absolute inset-0" />
      <HeroGlobe />

      <div className="relative mx-auto max-w-3xl text-center">
        <a
          href="#ai"
          className="hero-entrance hero-entrance-1 eyebrow-shimmer glass group relative isolate inline-flex items-center gap-2 overflow-hidden rounded-full px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="relative flex h-2.5 w-2.5" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <span>New &middot; Lamplit Light</span>
          <span className="hidden text-muted-foreground sm:inline">
            AI that runs where you are
          </span>
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </a>

        <h1 className="hero-entrance hero-entrance-2 mt-7 text-balance font-display text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl lg:text-7xl">
          Practical tools for{" "}
          <span className="lamplit-text">real problems</span>
        </h1>

        <p className="hero-entrance hero-entrance-3 mx-auto mt-6 max-w-2xl text-balance text-lg leading-8 text-muted-foreground">
          From the visual AI agent builder Amistio and our AI lab Lamplit Light
          to medical exam prep, citizenship tools, career resources, developer
          utilities, and compliance &mdash; we build practical software that
          makes a real difference.
        </p>

        <div className="hero-entrance hero-entrance-4 mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#products"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[0_8px_30px_-10px_hsl(var(--glow)/0.6)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_38px_-12px_hsl(var(--glow)/0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Explore products
          </a>
          <a
            href="#our-story"
            className="glass inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Our story
          </a>
          <a
            href="#ai"
            className="group inline-flex items-center gap-1.5 rounded-lg px-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Meet Lamplit Light
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>
        </div>

        <div className="hero-entrance hero-entrance-4 mt-6">
          <SocialBar links={socialLinks} context="hero_social" />
        </div>

        <div className="hero-entrance hero-entrance-5 mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-muted-foreground/70">
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

        <div className="hero-entrance hero-entrance-5 mt-16">
          <a
            href="#our-story"
            aria-label="Read our story"
            className="inline-block rounded-full text-muted-foreground/50 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:animate-bounce"
          >
            <ArrowDown className="h-6 w-6" />
          </a>
        </div>
      </div>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
    </section>
  );
}
