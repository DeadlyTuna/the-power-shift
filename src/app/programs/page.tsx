import type { Metadata } from "next";
import { CalendarDays, MessagesSquare, PlayCircle, Users } from "lucide-react";
import { statements } from "@/content/assessment";
import { programs, type Program } from "@/content/programs";
import { credentials, whatsappLink } from "@/content/site";
import { testimonials } from "@/content/testimonials";
import { AssessmentPromo } from "@/components/assessment/AssessmentPromo";
import { CourseCard } from "@/components/courses/CourseCard";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { JsonLd } from "@/components/shared/JsonLd";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Card, Section, SectionHeading, type SectionTone } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Programs",
  description:
    "Live sessions, self-paced courses, 1:1 leadership coaching, Mindset Mastery and corporate training with Manisha Agrawal. Find the right starting point for you or your team.",
  path: "/programs",
});

const groups: {
  id: string;
  title: string;
  intro: string;
  select: (program: Program) => boolean;
  tone: SectionTone;
  icon: typeof CalendarDays;
}[] = [
  {
    id: "live-sessions",
    title: "Live sessions",
    intro:
      "Live online sessions with Manisha on Zoom. Show up, take part, and leave with practical tools you can use straight away.",
    select: (p) => Boolean(p.event),
    tone: "white",
    icon: CalendarDays,
  },
  {
    id: "courses",
    title: "Self-paced courses",
    intro:
      "Short video courses you can start today and take at your own pace, built around the same patterns Manisha works on live.",
    select: (p) => Boolean(p.course),
    tone: "mist",
    icon: PlayCircle,
  },
  {
    id: "coaching",
    title: "Coaching programs",
    intro:
      "Ongoing work on your own goals, at your pace. Each one starts with a free clarity call, where you decide together whether it's the right fit.",
    select: (p) => p.mode === "application",
    tone: "paper",
    icon: MessagesSquare,
  },
  {
    id: "organisations",
    title: "For organisations",
    intro:
      "Workshops and programs for teams, managers and women's networks, shaped around your people after a briefing call.",
    select: (p) => p.mode === "enquiry",
    tone: "mist",
    icon: Users,
  },
];

/** "I'll start when I feel ready." The first script in the assessment, and the one this page answers. */
const startScript = statements.find((s) => s.pattern === "readiness");

export default function ProgramsPage() {
  const grouped = groups
    .map((group) => ({ ...group, items: programs.filter(group.select) }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Programs", path: "/programs" },
        ])}
      />

      {/* Hero */}
      <Section tone="paper" className="pt-12 pb-16 md:pt-20 md:pb-20" aria-labelledby="programs-title">
        <div className="max-w-3xl">
          <p className="eyebrow text-marigold-700">Programs</p>
          <h1 id="programs-title" className="display-xl mt-4">
            Ways to work with Manisha
          </h1>
          <p className="lede mt-6 text-muted">
            Live sessions to get started, courses at your own pace, coaching to go deeper, and training for your
            organisation. Every path is led by
            Manisha Agrawal, drawing on {credentials.corporateYears} years of corporate leadership and{" "}
            {credentials.coachingYears} years of coaching.
          </p>
        </div>

        <nav aria-label="Program types" className="mt-10">
          <ul className="flex flex-wrap gap-3">
            {grouped.map((group) => {
              const Icon = group.icon;
              return (
                <li key={group.id}>
                  <a
                    href={`#${group.id}`}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[0.9375rem] font-semibold text-jamun-900 transition-colors hover:border-jamun-200 hover:bg-mist"
                  >
                    <Icon aria-hidden="true" className="size-4 text-marigold-700" />
                    {group.title}
                    <span className="text-muted">
                      <span className="sr-only">, </span>
                      {group.items.length}
                      <span className="sr-only"> {group.items.length === 1 ? "program" : "programs"}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </Section>

      {grouped.map((group) => (
        <Section key={group.id} id={group.id} tone={group.tone} aria-labelledby={`${group.id}-title`}>
          <SectionHeading title={<span id={`${group.id}-title`}>{group.title}</span>} intro={group.intro} />
          <Stagger
            role="list"
            className={group.id === "courses" ? "mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "mt-12 grid gap-6 md:grid-cols-2"}
          >
            {group.items.map((program) => (
              <StaggerItem key={program.slug} role="listitem">
                {program.course ? <CourseCard program={program} /> : <ProgramCard program={program} />}
              </StaggerItem>
            ))}
          </Stagger>
          {group.id === "courses" ? (
            <ButtonLink href="/courses" variant="outline" arrow className="mt-10">
              Browse all courses
            </ButtonLink>
          ) : null}
        </Section>
      ))}

      <AssessmentPromo />

      {testimonials.length > 0 ? (
        <Section tone="paper" aria-labelledby="stories-title">
          <SectionHeading
            eyebrow="In their words"
            title={<span id="stories-title">What clients say</span>}
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </Section>
      ) : null}

      {/* Not sure where to start? */}
      <Section tone="white" aria-labelledby="start-title">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Not sure where to start?"
              title={<span id="start-title">You don&apos;t need to have it figured out first</span>}
            />
            {startScript ? (
              <Reframe script={startScript.script} shift={startScript.shift} size="lg" className="mt-10" />
            ) : null}
          </div>

          <div className="grid gap-5">
            <Card className="p-7 sm:p-8">
              <h3 className="display-sm">Book a free clarity call</h3>
              <p className="mt-3 text-muted">
                Talk through your goals and what&apos;s in the way, and Manisha will recommend the right starting point
                for you.
              </p>
              <ButtonLink href="/book" arrow className="mt-6 w-full sm:w-auto">
                Book a free clarity call
              </ButtonLink>
            </Card>
            <Card className="p-7 sm:p-8">
              <h3 className="display-sm">Take the Power Self-Assessment</h3>
              <p className="mt-3 text-muted">
                {statements.length} statements, answered Often, Sometimes or Rarely. See where your power is leaking and
                which program speaks to it.
              </p>
              <ButtonLink href="/assessment" variant="outline" arrow className="mt-6 w-full text-balance sm:w-auto">
                Take the free Power Self-Assessment
              </ButtonLink>
            </Card>
            <p className="text-muted">
              Prefer to ask a quick question first?{" "}
              <a
                href={whatsappLink("Hi Manisha, I'm not sure which program is right for me. Can you help?")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900"
              >
                <WhatsAppIcon className="size-4 text-peacock-600" />
                Message us on WhatsApp
              </a>
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
