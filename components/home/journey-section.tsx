import type { LucideIcon } from "lucide-react";
import {
  Bot,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  Lamp,
  Lightbulb,
  Stethoscope,
} from "lucide-react";
import { OutboundLink } from "@/components/outbound-link";
import { RevealSection } from "@/components/home/reveal-section";
import { socialLinks } from "@/lib/site-data";

interface Milestone {
  year: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

const milestones: Milestone[] = [
  {
    year: "2020",
    title: "bitesinbyte is born",
    desc: "What started as a side project: a place to learn in the open and ship small, useful software.",
    icon: Lightbulb,
  },
  {
    year: "2024",
    title: "Leben in Deutschland goes live",
    desc: "A citizenship test app and website - completely free. Most prep apps drown learners in ads, which defeats the purpose of learning. So we built one without the noise.",
    icon: GraduationCap,
  },
  {
    year: "2025",
    title: "Kenntnistrainer & Fachsprachtrainer",
    desc: "AI-powered exam simulation for international doctors in Germany - structured cases, instant feedback, and real medical German.",
    icon: Stethoscope,
  },
  {
    year: "2026",
    title: "Amistio MVP launches",
    desc: "Our visual AI agent builder goes live: agents that do real work, with versioning and approvals keeping humans in control.",
    icon: Bot,
  },
  {
    year: "2026",
    title: "bitesinbyte becomes Lamplit Labs",
    desc: "A new name to match where we're headed - a lab that shines a focused light on real problems.",
    icon: Lamp,
  },
];

const futurePillars = [
  {
    icon: FlaskConical,
    title: "Model research",
    desc: "Studying how AI models are developed, trained, and improved - and contributing what we learn.",
  },
  {
    icon: HeartHandshake,
    title: "Tools for humans",
    desc: "Building focused products for real use cases that genuinely benefit people.",
  },
];

export function JourneySection() {
  return (
    <section id="journey" className="border-t">
      <div className="mx-auto max-w-5xl px-4 py-24">
        <RevealSection className="mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            Our Journey
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            From a side project to a lab
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Six years of building useful things - and a clear view of where the
            light points next.
          </p>
        </RevealSection>

        {/* Milestones on a line that grows warmer toward the future */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-4 top-2 w-px -translate-x-1/2 bg-gradient-to-b from-border/30 via-border to-primary/60 md:left-1/2"
          />

          <ol className="space-y-10">
            {milestones.map((milestone, index) => {
              const cardOnLeft = index % 2 === 0;

              return (
                <li key={`${milestone.year}-${milestone.title}`} className="relative">
                  <RevealSection>
                    <span
                      aria-hidden="true"
                      className="absolute left-4 top-9 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background md:left-1/2"
                    />

                    <div className="pl-12 md:grid md:grid-cols-2 md:items-start md:gap-16 md:pl-0">
                      {!cardOnLeft && (
                        <div className="hidden pt-5 text-right md:block">
                          <span className="font-display text-3xl font-semibold tracking-tight text-primary/80">
                            {milestone.year}
                          </span>
                        </div>
                      )}

                      <div className="group rounded-xl border bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-md">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex rounded-lg bg-muted p-2.5 transition-colors group-hover:bg-primary/10">
                            <milestone.icon className="h-4 w-4 text-foreground/70" />
                          </span>
                          <div>
                            <p className="font-mono text-xs text-primary md:hidden">
                              {milestone.year}
                            </p>
                            <h3 className="font-semibold">{milestone.title}</h3>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {milestone.desc}
                        </p>
                      </div>

                      {cardOnLeft && (
                        <div className="hidden pt-5 md:block">
                          <span className="font-display text-3xl font-semibold tracking-tight text-primary/80">
                            {milestone.year}
                          </span>
                        </div>
                      )}
                    </div>
                  </RevealSection>
                </li>
              );
            })}
          </ol>
        </div>

        {/* The road ahead - dashed line into a glowing beacon */}
        <div className="relative">
          <RevealSection>
            <div
              aria-hidden="true"
              className="absolute left-4 top-0 h-10 border-l border-dashed border-primary/50 md:left-1/2"
            />
            <span
              aria-hidden="true"
              className="absolute left-4 top-10 -translate-x-1/2 md:left-1/2"
            >
              <span className="relative flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary/40 motion-safe:animate-ping [animation-duration:2.5s]" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-primary shadow-[0_0_16px_hsl(var(--glow)/0.6)]" />
              </span>
            </span>

            <div className="pl-12 pt-16 md:mx-auto md:max-w-2xl md:pl-0">
              <div className="rounded-xl border border-primary/25 bg-primary/5 p-6">
                <p className="font-mono text-xs uppercase tracking-wider text-primary">
                  What&apos;s next
                </p>
                <h3 className="mt-2 text-lg font-semibold">
                  A lab in the truest sense
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  As our name promises, we&apos;re going deeper: researching how
                  models are built and improved, while shipping practical tools
                  that put that knowledge to work for people.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {futurePillars.map((pillar) => (
                    <div
                      key={pillar.title}
                      className="flex gap-3 rounded-lg border bg-background/60 p-4"
                    >
                      <span className="inline-flex h-fit rounded-lg bg-primary/10 p-2">
                        <pillar.icon className="h-4 w-4 text-primary" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{pillar.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {pillar.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-5 text-sm text-muted-foreground">
                  Want to follow along?{" "}
                  <OutboundLink
                    href={socialLinks.blog}
                    target="_blank"
                    rel="noopener noreferrer"
                    trackingTarget="blog"
                    trackingContext="journey_section"
                    trackingUrl={socialLinks.blog}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Read the blog &rarr;
                  </OutboundLink>
                </p>
              </div>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}
