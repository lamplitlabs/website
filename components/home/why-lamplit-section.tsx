import { LamplitIllustration } from "@/components/lamplit-illustration";
import { RevealSection } from "@/components/home/reveal-section";

export function WhyLamplitSection() {
  return (
    <section id="our-story" className="border-t">
      <div className="mx-auto max-w-5xl px-4 py-24">
        <RevealSection>
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
              Our Story
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Why &ldquo;Lamplit Labs&rdquo;?
            </h2>
          </div>
        </RevealSection>

        <div className="grid items-center gap-12 md:grid-cols-2">
          <RevealSection>
            <div className="flex justify-center">
              <LamplitIllustration className="w-full max-w-md" />
            </div>
          </RevealSection>

          <RevealSection>
            <div className="space-y-6">
              <div className="rounded-xl border bg-muted/30 p-5">
                <p className="font-mono text-sm text-primary">
                  lamplit /&#712;lamp&#183;l&#618;t/
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <em>adjective</em> &mdash; illuminated by the light of a lamp.
                  A warm, focused glow that cuts through darkness and brings
                  clarity to what matters.
                </p>
              </div>

              <div className="rounded-xl border bg-muted/30 p-5">
                <p className="text-sm text-muted-foreground">
                  We chose <strong className="text-foreground">&ldquo;Lamplit Labs&rdquo;</strong>{" "}
                  because it captures exactly how we work: shining a focused light
                  on real problems, then building practical tools to solve them.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  No hype, no complexity for its own sake &mdash; just clear,
                  purposeful software that illuminates the path forward for our
                  users.
                </p>
              </div>

              <div className="rounded-xl border bg-muted/30 p-5">
                <p className="text-sm text-muted-foreground">
                  Formerly known as <span className="font-mono text-muted-foreground">bitesinbyte</span>,
                  we&apos;ve grown from a side project into a lab that ships
                  products used by thousands.
                </p>
              </div>
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}
