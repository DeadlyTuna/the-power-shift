import { assessmentCopy, statements } from "@/content/assessment";
import { site } from "@/content/site";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Layout";
import { CredentialsStrip } from "./CredentialsStrip";
import { ReframeRotator } from "./ReframeRotator";
import { ShimmerLink } from "./ShimmerLink";
import { WordReveal } from "./WordReveal";

/**
 * The thesis: you are capable; a silent script is holding you back; scripts
 * can be rewritten. The rotator on the right shows it happening, and the
 * one primary action is the free assessment.
 *
 * Entrance: the headline arrives word by word, then the lede, the actions
 * and the notebook follow in a short cascade (all under a second).
 */
export function HomeHero() {
  return (
    <section data-tone="paper" aria-labelledby="home-title" className="relative overflow-hidden bg-paper">
      {/* A soft marigold and plum glow behind the notebook; decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-12rem] size-[42rem] rounded-full bg-[radial-gradient(closest-side,rgba(247,200,122,0.35),rgba(238,232,244,0.5)_55%,transparent)] blur-2xl max-lg:top-auto max-lg:-bottom-40 max-lg:size-[30rem]"
      />

      <Container className="relative grid items-center gap-14 pt-10 pb-14 sm:pt-14 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] lg:gap-16 lg:pt-20 lg:pb-20 xl:gap-24">
        <div>
          <Reveal from="none" amount={0}>
            <p className="eyebrow text-marigold-700">
              {site.coach} <span aria-hidden="true">·</span>
              <span className="sr-only">,</span> {site.role}
            </p>
          </Reveal>
          <WordReveal as="h1" id="home-title" className="display-xl mt-5" text="Step into your power." delay={0.1} />

          <Reveal from="up" delay={0.45} amount={0}>
            <p className="lede mt-6 max-w-xl text-ink">
              You&rsquo;ve worked hard, but something is missing. You&rsquo;re ambitious, yet held back by self-doubt,
              leadership challenges or a lack of clarity.
            </p>
            <p className="mt-4 max-w-xl text-muted">
              It isn&rsquo;t a lack of ability. It&rsquo;s a silent script running in your head, and a script can be
              rewritten.
            </p>
          </Reveal>

          <Reveal
            from="up"
            delay={0.6}
            amount={0}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start"
          >
            <div className="flex flex-col gap-2.5">
              <ShimmerLink
                href="/assessment"
                aria-describedby="hero-assessment-note"
                className="px-6 text-base text-balance sm:px-8 sm:text-[1.0625rem]"
              >
                Take the free Power Self-Assessment
              </ShimmerLink>
              <p id="hero-assessment-note" className="text-center text-[0.9375rem] text-muted sm:pl-8 sm:text-left">
                {statements.length} statements <span aria-hidden="true">·</span>
                <span className="sr-only">,</span> about {assessmentCopy.minutes} minutes
              </p>
            </div>
            <ButtonLink href="/programs" size="lg" variant="outline">
              Explore programs
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal from="up" delay={0.35} amount={0} className="w-full max-w-xl lg:max-w-none">
          <ReframeRotator className="w-full" />
        </Reveal>
      </Container>

      <Container className="relative pb-4 lg:pb-8">
        <h2 className="sr-only">Manisha&rsquo;s background</h2>
        <CredentialsStrip />
      </Container>
    </section>
  );
}
