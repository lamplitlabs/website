import { ArrowDown } from "lucide-react";
import { HeroGlobe } from "@/components/hero-globe";
import { SocialBar } from "@/components/social-bar";
import { socialLinks } from "@/lib/site-data";

export function HeroSection() {
  return (
    <section className="hero-lamplight relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-14">
      <HeroGlobe />

      <div className="relative mx-auto max-w-3xl text-center">
        <h1 className="hero-entrance hero-entrance-2 font-display text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
          Practical tools for{" "}
          <span className="lamplit-text">real problems</span>
        </h1>

        <p className="hero-entrance hero-entrance-3 mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
          From the visual AI agent builder Amistio to medical exam prep,
          citizenship tools, career resources, developer utilities, and
          compliance &mdash; we build practical software that makes a real
          difference.
        </p>

        <div className="hero-entrance hero-entrance-4 mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#products"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
          >
            Explore products
          </a>
          <a
            href="#our-story"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Our story
          </a>
        </div>

        <div className="hero-entrance hero-entrance-4 mt-6">
          <SocialBar links={socialLinks} context="hero_social" />
        </div>

        <div className="hero-entrance hero-entrance-5 mt-16 animate-bounce">
          <a
            href="#our-story"
            className="inline-block text-muted-foreground/50 transition-colors hover:text-muted-foreground"
          >
            <ArrowDown className="h-6 w-6" />
          </a>
        </div>
      </div>
    </section>
  );
}
