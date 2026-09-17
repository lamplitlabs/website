import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Blocks,
  Check,
  Cpu,
  Laptop,
  MonitorSmartphone,
  Router,
  Server,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { HuggingFaceIcon } from "@/components/icons";
import { OutboundLink } from "@/components/outbound-link";
import { RevealSection } from "@/components/home/reveal-section";
import { getProductBySlug, socialLinks } from "@/lib/site-data";
import styles from "./ai-section.module.css";

const lightProduct = getProductBySlug("light");
const lightStatus = lightProduct?.status ?? "In development";
const lightStatusLabel =
  lightStatus === "Live"
    ? "Live \u00b7 public site at ai.lamplitlabs.com"
    : "In development \u00b7 public site coming to ai.lamplitlabs.com";
const lightHomeUrl = "https://ai.lamplitlabs.com";
const lightTryUrl = "https://ai.lamplitlabs.com/try";

interface RuntimeCard {
  index: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

const runtimes: RuntimeCard[] = [
  {
    index: "01",
    title: "Browser",
    desc: "Runs on WebGPU or WASM through transformers.js. Nothing leaves the tab.",
    icon: MonitorSmartphone,
  },
  {
    index: "02",
    title: "Laptop",
    desc: "Local sessions on hardware already in your hands.",
    icon: Laptop,
  },
  {
    index: "03",
    title: "On-prem / private cloud",
    desc: "Your servers, your network. The same exported model.",
    icon: Server,
  },
  {
    index: "04",
    title: "Inside your app",
    desc: "Embedded where your product already runs, with no round trip.",
    icon: Blocks,
  },
  {
    index: "05",
    title: "Edge / IoT",
    desc: "Small enough to ship close to the signal.",
    icon: Router,
  },
];

interface BuildStep {
  index: string;
  label: string;
  title: string;
  desc: string;
}

const buildSteps: BuildStep[] = [
  {
    index: "01",
    label: "define",
    title: "Define the job",
    desc: "A narrow purpose and a clear bar the model has to clear.",
  },
  {
    index: "02",
    label: "verify",
    title: "Gather verified knowledge",
    desc: "Ground the model in source material that can be checked.",
  },
  {
    index: "03",
    label: "train",
    title: "Train a specialist",
    desc: "A small model is trained for exactly this job and nothing else, so it stays small enough to run on your hardware.",
  },
  {
    index: "04",
    label: "measure",
    title: "Measure",
    desc: "Deterministic release gates and an independent judge panel decide what ships.",
  },
  {
    index: "05",
    label: "ship",
    title: "Compress and ship",
    desc: "Exported to ONNX and quantised, it loads straight into transformers.js.",
  },
];

// The light travels the rail during the first `beamTravelFraction` of each
// cycle (see `beam-comet` in globals.css), so stage k lights up when the head
// passes it at k / (stages - 1) of that travel.
const beamCycleSeconds = 8;
const beamTravelFraction = 0.78;

function beamDelay(index: number): string {
  const seconds =
    (beamCycleSeconds * beamTravelFraction * index) / (buildSteps.length - 1);
  return `${seconds.toFixed(2)}s`;
}

const familyPoints: { key: string; text: ReactNode }[] = [
  {
    key: "one-job",
    text: (
      <>
        One clearly defined job per model, named{" "}
        <code className="whitespace-nowrap font-mono text-[0.8125rem] text-foreground/90">
          light-&lt;purpose&gt;-&lt;version&gt;
        </code>
        .
      </>
    ),
  },
  {
    key: "release-facts",
    text: "Every release lists its purpose, base model, size, licence and gate result.",
  },
  {
    key: "runs-where-it-fits",
    text: "Models that fit run in the browser; the rest run on hardware you control.",
  },
  {
    key: "data-stays",
    text: "Your prompts and data stay on the device or server you run the model on.",
  },
];

function ModelOnDeviceIllustration() {
  return (
    <div aria-hidden="true" className={styles.modelScene}>
      <div className={styles.sceneLabel}>
        <span className={styles.sceneIndicator} />
        Lamplit Light
      </div>
      <div className={styles.modelFloor} />
      <div className={styles.modelOrbit} />
      <div className={styles.modelRig}>
        <div className={styles.modelDevice}>
          <span className={styles.devicePort} />
        </div>
        <div className={styles.modelCircuit}>
          <svg viewBox="0 0 160 200" fill="none">
            <path d="M0 44H40V78H64M160 44H120V78H96M0 156H40V122H64M160 156H120V122H96M62 0V48H80V72M100 200V152H80V128" />
            <circle cx="40" cy="44" r="3" />
            <circle cx="120" cy="44" r="3" />
            <circle cx="40" cy="156" r="3" />
            <circle cx="120" cy="156" r="3" />
          </svg>
        </div>
        <div className={styles.modelLayer}>
          <span className={styles.layerNode} />
          <span className={styles.layerNode} />
          <span className={styles.layerNode} />
          <span className={styles.layerNode} />
        </div>
        <div className={styles.modelCore}>
          <Cpu className="h-10 w-10" strokeWidth={1} />
          <span>Light</span>
        </div>
      </div>
      <span className={styles.sceneCaption}>your model / your hardware</span>
    </div>
  );
}

export function AiSection() {
  return (
    <section id="ai" className={`lab-grid border-t ${styles.section}`}>
      <div className="mx-auto max-w-6xl px-4 py-24">
        <RevealSection className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            Lamplit Light &middot; our AI lab
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            AI that runs{" "}
            <span className="lamplit-text">where you are.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            We build small, specialised models you host yourself - in a browser,
            on a laptop, on-prem, in your private cloud, inside your app or on
            the edge. Your data never leaves. The weights are yours.
          </p>
          <p className="mono-label mt-5 text-primary">
            small models &middot; hosted by you &middot; no data leaves
          </p>
        </RevealSection>

        <div className="mt-16">
          <RevealSection className="mb-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mono-label text-primary">where it runs</p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                  The runtime changes, the model does not.
                </h3>
              </div>
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                Sovereign means you hold the weights, control the hardware, and
                decide when models change, what they cost, and who reads traffic.
              </p>
            </div>
          </RevealSection>

          <RevealSection className="reveal-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {runtimes.map((runtime) => (
              <article
                key={runtime.title}
                className={`glass glass-lift rounded-2xl p-4 ${styles.runtimeCard}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="mono-label text-primary">
                    {runtime.index}
                  </span>
                  <span className={`rounded-lg bg-primary/10 p-2 text-primary ${styles.runtimeIcon}`}>
                    <runtime.icon className="h-4 w-4" />
                  </span>
                </div>
                <h4 className="mt-5 font-semibold">{runtime.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {runtime.desc}
                </p>
              </article>
            ))}
          </RevealSection>
        </div>

        <div className="mt-16">
          <RevealSection className="mb-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mono-label text-primary">how a model is built</p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">
                  A high-level path from job to shipped runtime.
                </h3>
              </div>
              <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                Five stages, one bar to clear. A model that fails its gate does
                not ship.
              </p>
            </div>
          </RevealSection>

          <RevealSection>
            <div className={`glass overflow-hidden rounded-2xl ${styles.pipelinePanel}`}>
              <div className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-3">
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--glow)/0.75)]"
                  />
                  <span className="mono-label">build pipeline</span>
                </div>
                <code className="hidden font-mono text-xs text-muted-foreground sm:block">
                  light-&lt;purpose&gt;-&lt;version&gt;
                </code>
              </div>

              {/* Desktop rail: a light pulse travels stage to stage. Decorative;
                  the stage list below carries the content. */}
              <div aria-hidden="true" className="relative hidden h-16 lg:block">
                <div className="absolute left-[10%] right-[10%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10" />
                <div className="absolute inset-y-0 left-[10%] right-[10%] overflow-hidden">
                  <span className="beam-comet absolute top-1/2 h-px w-0 opacity-0">
                    <span className="absolute right-0 top-1/2 h-0.5 w-32 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-primary/70 to-primary shadow-[0_0_14px_hsl(var(--glow)/0.85)]" />
                  </span>
                </div>
                {buildSteps.map((step, index) => (
                  <span
                    key={step.index}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${10 + index * 20}%` }}
                  >
                    <span
                      className="beam-ping absolute inset-0 rounded-full border border-primary opacity-0"
                      style={{ animationDelay: beamDelay(index) }}
                    />
                    <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-primary/40 bg-background">
                      <span
                        className="beam-flash h-2 w-2 rounded-full bg-primary"
                        style={{ animationDelay: beamDelay(index) }}
                      />
                    </span>
                    <span className="absolute left-1/2 top-full h-5 w-px bg-border/70" />
                  </span>
                ))}
              </div>

              <ol className="grid lg:grid-cols-5 lg:divide-x lg:divide-border/60 lg:border-t lg:border-border/60">
                {buildSteps.map((step, index) => (
                  <li
                    key={step.index}
                    className="relative py-5 pl-14 pr-5 before:absolute before:bottom-0 before:left-8 before:top-10 before:w-px before:bg-border/70 after:absolute after:left-8 after:top-0 after:h-4 after:w-px after:bg-border/70 first:after:hidden last:before:hidden lg:p-5 lg:before:hidden lg:after:hidden"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-5 top-4 flex h-6 w-6 items-center justify-center rounded-full border border-primary/40 bg-background lg:hidden"
                    >
                      <span
                        className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--glow)/0.6)] motion-safe:animate-pulse"
                        style={{
                          animationDelay: `${index * 0.6}s`,
                          animationDuration: "3s",
                        }}
                      />
                    </span>
                    <p className="mono-label text-primary">
                      {step.index}
                      <span className="text-muted-foreground"> / {step.label}</span>
                    </p>
                    <h4 className="mt-3 font-semibold">{step.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.desc}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </RevealSection>
        </div>

        <RevealSection className="mt-16">
          <div className={`glass grid gap-8 rounded-2xl p-6 sm:grid-cols-[1.2fr_1fr] sm:p-8 ${styles.familyPanel}`}>
            <div>
              <p className="mono-label text-primary">the model family</p>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight">
                One job per model. Every model yours to run.
              </h3>
              <ul className="mt-6 space-y-3">
                {familyPoints.map((point) => (
                  <li
                    key={point.key}
                    className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{point.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--glow)/0.75)]" />
                {lightStatusLabel}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <OutboundLink
                  href={lightHomeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  trackingTarget="light"
                  trackingContext="ai_section"
                  trackingUrl={lightHomeUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Explore Lamplit Light
                  <ArrowUpRight className="h-4 w-4" />
                </OutboundLink>
                <OutboundLink
                  href={lightTryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  trackingTarget="light_try"
                  trackingContext="ai_section"
                  trackingUrl={lightTryUrl}
                  className="inline-flex items-center justify-center rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Try a model in your browser
                </OutboundLink>
                <OutboundLink
                  href={socialLinks.huggingface}
                  target="_blank"
                  rel="noopener noreferrer"
                  trackingTarget="huggingface"
                  trackingContext="ai_section"
                  trackingUrl={socialLinks.huggingface}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <HuggingFaceIcon className="h-4 w-4" />
                  Lamplit Labs on Hugging Face
                </OutboundLink>
                <Link
                  href="/products/light"
                  className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Product details &rarr;
                </Link>
              </div>
            </div>

            <ModelOnDeviceIllustration />
          </div>
        </RevealSection>

        <RevealSection className="mx-auto mt-8 max-w-3xl text-center">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every model is measured before it ships. The release gates and the
            judge panel decide, and the numbers are published on the AI site
            &mdash; including the ones that fail.
          </p>
        </RevealSection>
      </div>
    </section>
  );
}
