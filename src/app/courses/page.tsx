import type { Metadata } from "next";
import { BookOpenCheck, MonitorPlay, UserRoundPlus } from "lucide-react";
import { courseCategories, courseLessons, courseMinutes, courses } from "@/content/courses";
import { absoluteUrl, credentials, site } from "@/content/site";
import { AssessmentPromo } from "@/components/assessment/AssessmentPromo";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseCatalog } from "@/components/courses/CourseCatalog";
import { courseHref } from "@/components/courses/course-helpers";
import { Ticker } from "@/components/courses/Ticker";
import { DotPattern } from "@/components/kit/dot-pattern";
import { TextAnimate } from "@/components/kit/text-animate";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerList, StaggerListItem } from "@/components/motion/Stagger";
import { JsonLd } from "@/components/shared/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Section, SectionHeading } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Self-paced courses",
  description: `Short video courses from ${site.coach} on confidence, decisions, boundaries and leadership. Learn at your own pace, on any device.`,
  path: "/courses",
});

const STEPS = [
  {
    icon: UserRoundPlus,
    title: "Create a free account",
    body: "It takes a minute, and keeps your courses and progress in one place.",
  },
  {
    icon: BookOpenCheck,
    title: "Enroll in a course",
    body: "Pick the course that fits what you're working on. Every course has free preview lessons first.",
  },
  {
    icon: MonitorPlay,
    title: "Learn at your pace",
    body: "Short lessons with a practical exercise each. Mark them done as you go and pick up where you left off.",
  },
];

export default function CoursesPage() {
  const totalLessons = courses.reduce((sum, c) => sum + courseLessons(c).length, 0);
  const totalHours = Math.round(courses.reduce((sum, c) => sum + courseMinutes(c), 0) / 60);

  const items = courses.map((course) => ({
    slug: course.slug,
    category: course.course?.category ?? "",
    card: <CourseCard program={course} headingLevel="h3" />,
  }));

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((course, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(courseHref(course.slug)),
      name: course.title,
    })),
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Courses", path: "/courses" },
          ]),
          itemList,
        ]}
      />

      {/* Hero */}
      <Section tone="paper" className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        <DotPattern
          width={22}
          height={22}
          cr={1.3}
          className="text-jamun-200 [mask-image:radial-gradient(ellipse_at_top_right,black_10%,transparent_65%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-32 size-[34rem] rounded-full bg-marigold-200/60 blur-3xl"
        />
        <div className="relative grid items-end gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div>
            <Reveal from="none" blur>
              <p className="eyebrow text-marigold-700">Self-paced courses</p>
            </Reveal>
            {/* Split by line: the kit's word split keeps a visible space at the start of wrapped lines. */}
            <TextAnimate
              as="h1"
              by="line"
              animation="blurInUp"
              duration={0.5}
              once
              data-reveal=""
              segmentClassName="[html:not(.js)_&]:!opacity-100 [html:not(.js)_&]:!filter-none [html:not(.js)_&]:!transform-none"
              className="display-xl mt-4 text-jamun-900"
            >
              {"Grow at your\nown pace"}
            </TextAnimate>
            <Reveal delay={0.25}>
              <p className="lede mt-6 max-w-2xl text-muted">
                Short video lessons from {site.coach}, each with a practical exercise you can use the same day. Built on
                the tools she has refined over {credentials.coachingYears} years of coaching, and yours to revisit
                whenever you need them.
              </p>
            </Reveal>

            <Reveal delay={0.35}>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6">
                <div>
                  <dt className="text-sm text-muted">Courses</dt>
                  <dd className="font-display text-4xl leading-none text-jamun-900 sm:text-5xl">
                    <Ticker value={courses.length} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Lessons</dt>
                  <dd className="font-display text-4xl leading-none text-jamun-900 sm:text-5xl">
                    <Ticker value={totalLessons} delay={0.1} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">Hours of video</dt>
                  <dd className="font-display text-4xl leading-none text-jamun-900 sm:text-5xl">
                    <Ticker value={totalHours} delay={0.2} />
                  </dd>
                </div>
              </dl>
            </Reveal>
          </div>

          <Reveal from="right" delay={0.2}>
            <Card className="relative bg-white/85 p-7 backdrop-blur-sm sm:p-9">
              <Reframe
                script="I'll work on myself when I have more time."
                shift="Ten minutes is enough to start."
                size="lg"
              />
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* Catalog */}
      <Section tone="white" id="catalog" aria-labelledby="catalog-title" className="pt-16 md:pt-20">
        <h2 id="catalog-title" className="sr-only">
          All courses
        </h2>
        <CourseCatalog items={items} categories={courseCategories} />
      </Section>

      {/* How it works */}
      <Section tone="paper" aria-labelledby="how-title">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title={<span id="how-title">From sign-up to your first lesson in minutes</span>}
          />
        </Reveal>
        <StaggerList className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <StaggerListItem key={step.title} className="flex">
                <Card className="flex w-full flex-col p-7 transition-[translate,box-shadow] duration-300 ease-shift hover:-translate-y-1 hover:shadow-[0_24px_48px_-30px_rgba(42,22,54,0.4)]">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-12 items-center justify-center rounded-full bg-marigold-200 text-jamun-900">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <span aria-hidden="true" className="font-display text-4xl leading-none text-jamun-200">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="display-sm mt-6">{step.title}</h3>
                  <p className="mt-2 text-muted">{step.body}</p>
                </Card>
              </StaggerListItem>
            );
          })}
        </StaggerList>
        <Reveal delay={0.1}>
          <p className="mt-10 max-w-2xl text-[0.9375rem] text-muted">
            Prefer to learn live, with Manisha in the room?{" "}
            <ButtonLink href="/programs" variant="link" arrow className="min-h-11">
              See live sessions and coaching
            </ButtonLink>
          </p>
        </Reveal>
      </Section>

      <AssessmentPromo />
    </>
  );
}
