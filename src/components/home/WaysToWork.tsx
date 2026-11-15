import { courses } from "@/content/courses";
import { getProgram, type Program } from "@/content/programs";
import { services } from "@/content/site";
import { CourseCard } from "@/components/courses/CourseCard";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerList, StaggerListItem } from "@/components/motion/Stagger";
import { ButtonLink } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";

/** Individual programs shown on the home page, in the order a newcomer might try them. */
const FEATURED = ["be-heard-masterclass", "leadership-confidence-workshop", "one-to-one-coaching", "mindset-mastery"];

/** One self-paced course from each of three themes (src/content/courses.ts). */
const FEATURED_COURSES = ["speak-up-with-confidence", "decide-without-overthinking", "executive-presence-essentials"];

export function WaysToWork() {
  const featured = FEATURED.map((slug) => getProgram(slug)).filter((p): p is Program => Boolean(p));
  const featuredCourses = FEATURED_COURSES.map((slug) => courses.find((c) => c.slug === slug)).filter(
    (c): c is Program => Boolean(c),
  );
  const corporate = getProgram("corporate-training");
  const corporateService = services.find((s) => s.id === "corporate");
  const corporateFacts = corporate?.format
    .filter((f) => f.label === "Format" || f.label === "Investment")
    .map((f) => f.value)
    .join(" · ");

  return (
    <Section tone="paper" aria-labelledby="ways-title">
      <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Programs"
          title={<span id="ways-title">Ways to work together</span>}
          intro="Live sessions to get started, courses to learn at your own pace, coaching to go deeper, and training for your team."
        />
        <ButtonLink href="/programs" variant="link" arrow className="min-h-11 shrink-0 self-start md:self-auto">
          See all programs
        </ButtonLink>
      </Reveal>

      <StaggerList stagger={0.1} className="mt-12 grid gap-5 md:grid-cols-2 lg:gap-6">
        {featured.map((program) => (
          <StaggerListItem key={program.slug}>
            <ProgramCard program={program} headingLevel="h3" />
          </StaggerListItem>
        ))}
      </StaggerList>

      {featuredCourses.length > 0 ? (
        <div className="mt-16 lg:mt-20">
          <Reveal className="flex flex-col gap-4 border-t border-line pt-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow text-marigold-700">Self-paced courses</p>
              <h3 id="ways-courses-title" className="display-md mt-3">
                Learn at your own pace
              </h3>
              <p className="mt-3 text-muted">
                Short video lessons with a practical exercise each, on any device. Start with the free preview lessons.
              </p>
            </div>
            <ButtonLink href="/courses" variant="link" arrow className="min-h-11 shrink-0 self-start md:self-auto">
              Browse all {courses.length} courses
            </ButtonLink>
          </Reveal>

          {/* Two on phones and tablets, the third joins on desktop. */}
          <StaggerList stagger={0.1} className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {featuredCourses.map((course, i) => (
              <StaggerListItem key={course.slug} className={cn(i === 2 && "hidden lg:block")}>
                <CourseCard program={course} headingLevel="h4" />
              </StaggerListItem>
            ))}
          </StaggerList>
        </div>
      ) : null}

      {corporate ? (
        <Reveal
          amount={0.25}
          className="mt-16 grid gap-8 rounded-card border border-jamun-900/15 bg-mist p-7 sm:p-10 lg:mt-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center lg:gap-16"
        >
          <div>
            <p className="eyebrow text-marigold-700">{corporate.audience}</p>
            <h3 className="display-md mt-3">Training for your teams and leaders</h3>
            <p className="mt-4 max-w-2xl text-ink">{corporateService?.body ?? corporate.promise}</p>
            <p className="mt-3 max-w-2xl text-[0.9875rem] text-muted">
              Workshops and programs for teams, managers and women&rsquo;s networks, including Power*N, the inner-power
              session Manisha led for the Aptiv Technical Center India DEI Council for women in engineering.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 lg:items-end">
            <ButtonLink href={corporate.landingPath ?? "/corporate"} variant="dark" size="lg" arrow>
              Explore corporate training
            </ButtonLink>
            {corporateFacts ? <p className="text-[0.9375rem] text-muted lg:text-right">{corporateFacts}</p> : null}
          </div>
        </Reveal>
      ) : null}
    </Section>
  );
}
