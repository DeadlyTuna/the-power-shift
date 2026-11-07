import { credentials, site } from "@/content/site";
import { TickedFigure } from "@/components/home/TickedFigure";
import { WordReveal } from "@/components/home/WordReveal";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Layout";
import { CoachMark } from "./CoachMark";

/** Her two verified year counts, counted up once beside the introduction. */
const figures = [
  { value: credentials.corporateYears, label: "Years of corporate leadership" },
  { value: credentials.coachingYears, label: "Years of coaching" },
];

export function AboutHero() {
  return (
    <section data-tone="paper" aria-labelledby="about-title" className="bg-paper">
      <Container className="grid gap-12 pt-10 pb-20 sm:pt-14 md:pb-24 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-20 lg:pt-20 lg:pb-28">
        <div>
          <Reveal from="none" amount={0}>
            <p className="eyebrow text-marigold-700">
              About {site.coach} <span aria-hidden="true">·</span>
              <span className="sr-only">,</span> {site.role}
            </p>
          </Reveal>
          <WordReveal
            as="h1"
            id="about-title"
            className="display-xl mt-5"
            text="Two decades of leading. Now she helps you lead."
            delay={0.1}
            stagger={0.07}
          />
          <Reveal from="up" delay={0.55} amount={0}>
            <p className="lede mt-6 max-w-2xl text-ink">
              {site.coach} has {credentials.corporateYears} years of corporate leadership behind her and{" "}
              {credentials.coachingYears} years of coaching. She helps working professionals build the clarity,
              confidence and emotional intelligence to step into stronger leadership positions.
            </p>
          </Reveal>

          <Reveal from="up" delay={0.7} amount={0}>
            <dl className="mt-10 grid max-w-lg grid-cols-2 border-t border-line">
              {figures.map((figure, i) => (
                <div key={figure.label} className={i === 0 ? "pt-5 pr-6" : "border-l border-line pt-5 pl-6"}>
                  <dt className="eyebrow text-[0.75rem] text-marigold-700">{figure.label}</dt>
                  <dd className="mt-2 font-display text-5xl leading-none text-jamun-900 sm:text-6xl">
                    <TickedFigure value={figure.value} delay={0.9 + i * 0.15} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal from="up" delay={0.3} amount={0} className="w-full max-w-md lg:max-w-none">
          <CoachMark eager className="w-full" sizes="(min-width: 1024px) 26rem, (min-width: 448px) 28rem, 100vw" />
        </Reveal>
      </Container>
    </section>
  );
}
