import { credentials, site } from "@/content/site";
import { CoachMark } from "@/components/about/CoachMark";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerList, StaggerListItem } from "@/components/motion/Stagger";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Layout";
import { HandUnderline } from "./HandUnderline";

/**
 * A short introduction, drawn from the "About the Coach" bio on the current
 * site. Her line about lived experience gets a hand-drawn marigold
 * underline as it scrolls into view.
 */
export function MeetManisha() {
  return (
    <Section tone="white" aria-labelledby="meet-title">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-20">
        <Reveal from="up" className="w-full max-w-md lg:max-w-none">
          <CoachMark className="w-full" sizes="(min-width: 1024px) 26rem, (min-width: 448px) 28rem, 100vw" />
        </Reveal>

        <Reveal from="up" delay={0.12}>
          <p className="eyebrow text-marigold-700">Meet {site.coach.split(" ")[0]}</p>
          <h2 id="meet-title" className="display-lg mt-4">
            Leadership from lived experience
          </h2>
          <p className="lede mt-6 text-ink">
            For {credentials.corporateYears} years, {site.coach} led teams in global corporate environments, navigating
            high-pressure decisions and working at boardroom level within complex corporate structures.
          </p>
          <p className="mt-4 max-w-2xl text-muted">
            Then she moved into coaching. For {credentials.coachingYears} years she has helped working professionals
            build the clarity, confidence and emotional intelligence to step into stronger leadership positions.
          </p>
          <p className="mt-6 max-w-2xl border-l-2 border-marigold-400 pl-5 text-lg font-semibold text-jamun-900">
            She doesn&rsquo;t teach leadership from theory. She teaches it from{" "}
            <HandUnderline>lived experience</HandUnderline>.
          </p>

          <StaggerList
            stagger={0.1}
            className="mt-8 flex flex-col gap-2 text-[0.9375rem] text-muted sm:flex-row sm:flex-wrap sm:gap-x-8"
          >
            {[credentials.education, credentials.formerRole].map((fact) => (
              <StaggerListItem key={fact} className="flex items-center gap-3">
                <span aria-hidden="true" className="h-px w-4 shrink-0 bg-marigold-400" />
                {fact}
              </StaggerListItem>
            ))}
          </StaggerList>

          <ButtonLink href="/about" variant="outline" size="lg" arrow className="mt-9">
            Read Manisha&rsquo;s story
          </ButtonLink>
        </Reveal>
      </div>
    </Section>
  );
}
