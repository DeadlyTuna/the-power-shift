import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  Award,
  BarChart3,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Infinity as InfinityIcon,
  Languages,
  PlayCircle,
  type LucideIcon,
} from "lucide-react";
import { patterns } from "@/content/assessment";
import { courses, getCourse } from "@/content/courses";
import type { Program } from "@/content/programs";
import { absoluteUrl, credentials, site, whatsappLink } from "@/content/site";
import { BeamCard } from "@/components/courses/BeamCard";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseCover } from "@/components/courses/CourseCover";
import { CourseEnrolledBadge } from "@/components/courses/CourseEnrolledBadge";
import { CourseEnrollPanel } from "@/components/courses/CourseEnrollPanel";
import { CourseStickyBar } from "@/components/courses/CourseStickyBar";
import { Curriculum } from "@/components/courses/Curriculum";
import { courseFacts, courseHref, pluralise } from "@/components/courses/course-helpers";
import { Ticker } from "@/components/courses/Ticker";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/kit/avatar";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem, StaggerList, StaggerListItem } from "@/components/motion/Stagger";
import { FaqAccordion } from "@/components/programs/FaqAccordion";
import { joinList, primaryPattern } from "@/components/programs/program-helpers";
import { JsonLd } from "@/components/shared/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Container, Section } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";
import { formatINR } from "@/lib/format";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

/**
 * /courses/[slug]: one self-paced course. Static; everything that depends on
 * the visitor (signed in, enrolled, progress) is decided in small client
 * children after hydration.
 */

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return pageMetadata({
    title: course.title,
    description: course.summary,
    path: courseHref(course.slug),
  });
}

const HERO_CTA_ID = "course-enroll-card";
const ENROLL_ID = "enroll";

const inlineLink =
  "font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900";

function includeIcon(item: string): LucideIcon {
  const text = item.toLowerCase();
  if (text.includes("lifetime")) return InfinityIcon;
  if (text.includes("certificate")) return Award;
  if (text.includes("plan") || text.includes("tracker") || text.includes("daily")) return CalendarCheck;
  return FileText;
}

function courseJsonLd(course: Program) {
  const facts = courseFacts(course);
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.summary,
    url: absoluteUrl(courseHref(course.slug)),
    provider: { "@type": "Organization", name: site.brand, sameAs: site.url },
    ...(course.price
      ? {
          offers: {
            "@type": "Offer",
            category: "Paid",
            price: course.price.amount,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url: absoluteUrl(courseHref(course.slug)),
          },
        }
      : {}),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: `PT${Math.floor(facts.minutes / 60)}H${facts.minutes % 60}M`,
      instructor: { "@type": "Person", name: site.coach },
    },
  };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course?.course) notFound();

  const details = course.course;
  const facts = courseFacts(course);
  const pattern = primaryPattern(course);
  const addressed = course.addresses
    .map((id) => patterns.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const related = courses
    .filter((c) => c.slug !== course.slug)
    .sort((a, b) => Number(b.course?.category === details.category) - Number(a.course?.category === details.category))
    .slice(0, 3);

  const includes: { icon: LucideIcon; label: string }[] = [
    { icon: PlayCircle, label: `${pluralise(facts.lessons, "video lesson")}, ${facts.length} in total` },
    ...(facts.previews
      ? [{ icon: Eye, label: `${pluralise(facts.previews, "free preview lesson")} to watch before you enroll` }]
      : []),
    ...details.includes.map((label) => ({ icon: includeIcon(label), label })),
    { icon: Languages, label: `Taught in ${facts.language}` },
  ];

  return (
    <>
      <JsonLd
        data={[
          courseJsonLd(course),
          ...(course.faqs.length ? [faqJsonLd(course.faqs)] : []),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Courses", path: "/courses" },
            { name: course.title, path: courseHref(course.slug) },
          ]),
        ]}
      />

      <div className="overflow-x-clip">
        <Container className="grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-x-12 xl:grid-cols-[minmax(0,1fr)_25rem] xl:gap-x-16">
          {/* Hero: a full-bleed jamun band behind the left column (and under the enroll card). */}
          <header
            data-tone="jamun"
            className="relative isolate pt-5 pb-16 text-jamun-100 md:pt-8 md:pb-20 lg:col-start-1 lg:row-start-1 lg:pb-24"
          >
            <div aria-hidden="true" className="absolute inset-y-0 -right-[100vw] -left-[100vw] -z-10 bg-jamun-900">
              <div className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent_40%,black_75%)] bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1.5px)] [background-size:22px_22px]" />
              <div className="absolute top-[-30%] left-1/2 size-[36rem] rounded-full bg-jamun-700/50 blur-3xl" />
            </div>

            <nav aria-label="Breadcrumb" className="text-[0.9375rem] text-jamun-200">
              <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                <li>
                  <Link
                    href="/courses"
                    className="inline-flex min-h-11 items-center underline-offset-4 hover:text-white hover:underline"
                  >
                    Courses
                  </Link>
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <ChevronRight aria-hidden="true" className="size-4" />
                  <span aria-current="page" className="text-white">
                    {course.shortTitle}
                  </span>
                </li>
              </ol>
            </nav>

            <Reveal from="none" className="mt-6 flex flex-wrap items-center gap-3">
              <p className="eyebrow text-marigold-300">
                {details.category} <span aria-hidden="true">·</span> Self-paced course
              </p>
              <CourseEnrolledBadge slug={course.slug} />
            </Reveal>
            <Reveal blur delay={0.05}>
              <h1 className="display-lg mt-4 max-w-3xl text-white">{course.title}</h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="lede mt-5 max-w-2xl text-white">{course.promise}</p>
              <p className="mt-4 max-w-2xl text-jamun-100">{course.summary}</p>
            </Reveal>

            <Reveal delay={0.25}>
              <dl className="mt-8 flex flex-wrap gap-2.5">
                <HeroFact icon={BarChart3} label="Level" value={facts.level} />
                <HeroFact icon={PlayCircle} label="Lessons" value={pluralise(facts.lessons, "lesson")} />
                <HeroFact icon={Clock3} label="Total length" value={`${facts.length} of video`} />
                <HeroFact icon={Languages} label="Language" value={facts.language} />
                <HeroFact icon={InfinityIcon} label="Access" value={`${facts.access} access`} />
              </dl>
              <p className="mt-6 text-[0.9375rem] text-jamun-200">
                {course.audience}.{" "}
                {facts.previews ? (
                  <a
                    href="#curriculum"
                    className="font-semibold text-white underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-white"
                  >
                    Watch {facts.previews === 1 ? "a free preview lesson" : "the free preview lessons"}
                  </a>
                ) : null}
              </p>
            </Reveal>
          </header>

          {/* Enroll card: after the hero on phones; a sticky right-hand column on desktop. */}
          <aside
            aria-label="Enroll"
            className="relative z-10 -mt-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:pt-10"
          >
            <div className="lg:sticky lg:top-24">
              <Reveal from="up" delay={0.1}>
                <BeamCard id={HERO_CTA_ID} className="shadow-[0_30px_60px_-36px_rgba(28,14,37,0.55)]">
                  <CourseCover program={course} />
                  <div className="p-6 sm:p-7">
                    <div className="flex items-baseline justify-between gap-4">
                      {course.price ? (
                        <p className="font-display text-[2.75rem] leading-none text-jamun-900">
                          <span className="sr-only">Price: </span>
                          {formatINR(course.price.amount)}
                        </p>
                      ) : null}
                      <p className="text-right text-sm text-muted">
                        One-time payment
                        <br />
                        {facts.access} access
                      </p>
                    </div>
                    <CourseEnrollPanel program={course} source="course-card" idPrefix="course-card" className="mt-6" />
                  </div>
                </BeamCard>
              </Reveal>
            </div>
          </aside>

          <div className="min-w-0 pb-6 lg:col-start-1 lg:row-start-2">
            {/* What you'll learn */}
            <BodySection id="learn" eyebrow="Outcomes" title="What you'll learn">
              <Card className="p-6 sm:p-8">
                <StaggerList className="grid gap-x-8 gap-y-5 md:grid-cols-2">
                  {course.outcomes.map((outcome) => (
                    <StaggerListItem key={outcome} className="flex gap-3.5">
                      <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-peacock-50 text-peacock-700">
                        <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
                      </span>
                      <span className="text-[1.0625rem] leading-snug text-ink">{outcome}</span>
                    </StaggerListItem>
                  ))}
                </StaggerList>
              </Card>
            </BodySection>

            {/* Curriculum */}
            <BodySection
              id="curriculum"
              eyebrow="Curriculum"
              title="Course content"
              intro={
                <dl className="flex flex-wrap gap-x-8 gap-y-3">
                  <Stat label={facts.modules === 1 ? "module" : "modules"} value={facts.modules} />
                  <Stat label={facts.lessons === 1 ? "lesson" : "lessons"} value={facts.lessons} />
                  <Stat label="minutes of video" value={facts.minutes} />
                </dl>
              }
            >
              <Reveal>
                <Curriculum slug={course.slug} courseTitle={course.title} modules={details.modules} />
              </Reveal>
            </BodySection>

            {/* Includes */}
            <BodySection id="includes" eyebrow="What you get" title="This course includes">
              <Stagger className="grid gap-3 sm:grid-cols-2">
                {includes.map(({ icon: Icon, label }) => (
                  <StaggerItem key={label}>
                    <div className="flex h-full items-center gap-3.5 rounded-xl border border-line bg-white px-4 py-3.5">
                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-marigold-200 text-jamun-900">
                        <Icon aria-hidden="true" className="size-[1.125rem]" />
                      </span>
                      <span className="leading-snug text-ink">{label}</span>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </BodySection>

            {/* Who it's for */}
            <BodySection id="for-you" eyebrow="Is it a fit?" title="Who this course is for">
              <Reveal>
                <p className="lede max-w-2xl text-ink">
                  {course.audience}.{" "}
                  {addressed.length === 1
                    ? "It works on this pattern from the free Power Self-Assessment:"
                    : `It works on these ${addressed.length} patterns from the free Power Self-Assessment:`}
                </p>
              </Reveal>
              <Stagger className="mt-6 grid gap-4 sm:grid-cols-2">
                {addressed.map((p) => (
                  <StaggerItem key={p.id}>
                    <Card className="h-full p-5 sm:p-6">
                      <p className="eyebrow text-[0.75rem] text-marigold-700">{p.power}</p>
                      <h3 className="mt-2 font-display text-[1.25rem] leading-snug">{p.name}</h3>
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{p.looksLike}</p>
                    </Card>
                  </StaggerItem>
                ))}
              </Stagger>
              {pattern ? (
                <Reveal className="mt-8">
                  <div className="rounded-card bg-mist p-6 sm:p-8">
                    <Reframe script={pattern.statement.script} shift={pattern.statement.shift} size="lg" />
                  </div>
                </Reveal>
              ) : null}
              <p className="mt-6 text-muted">
                Not sure which pattern is yours?{" "}
                <Link href="/assessment" className={inlineLink}>
                  Take the free Power Self-Assessment
                </Link>
              </p>
            </BodySection>

            {/* Instructor */}
            <BodySection id="instructor" eyebrow="Your coach" title={`Learn with ${site.coach}`}>
              <Reveal>
                <Card className="grid gap-6 p-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8 sm:p-8">
                  <Avatar className="size-24 ring-4 ring-marigold-200 sm:size-28">
                    {site.media.portrait ? <AvatarImage src={site.media.portrait} alt="" /> : null}
                    <AvatarFallback className="bg-jamun-900 font-display text-3xl text-marigold-300">MA</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-display text-[1.5rem] leading-tight text-jamun-900">{site.coach}</p>
                    <p className="text-muted">{site.role}</p>
                    <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-line py-4 sm:max-w-sm">
                      <div>
                        <dt className="sr-only">Years of corporate leadership</dt>
                        <dd className="font-display text-4xl leading-none text-jamun-900">
                          <Ticker value={parseInt(credentials.corporateYears, 10)} />+
                        </dd>
                        <dd aria-hidden="true" className="mt-1 text-sm text-muted">
                          years of corporate leadership
                        </dd>
                      </div>
                      <div>
                        <dt className="sr-only">Years of coaching</dt>
                        <dd className="font-display text-4xl leading-none text-jamun-900">
                          <Ticker value={parseInt(credentials.coachingYears, 10)} delay={0.15} />+
                        </dd>
                        <dd aria-hidden="true" className="mt-1 text-sm text-muted">
                          years of coaching
                        </dd>
                      </div>
                    </dl>
                    <ul className="mt-5 flex flex-col gap-2.5 text-[0.9875rem] text-ink">
                      <li className="flex gap-3">
                        <GraduationCap aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-marigold-700" />
                        {credentials.education}
                      </li>
                      <li className="flex gap-3">
                        <Award aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-marigold-700" />
                        {credentials.recognition}; formerly {credentials.formerRole.charAt(0).toLowerCase()}
                        {credentials.formerRole.slice(1)}
                      </li>
                      <li className="flex gap-3">
                        <Globe aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-marigold-700" />
                        Corporate leadership across {joinList(credentials.countries)}
                      </li>
                    </ul>
                    <ButtonLink href="/about" variant="link" arrow className="mt-5 min-h-11">
                      More about Manisha
                    </ButtonLink>
                  </div>
                </Card>
              </Reveal>
            </BodySection>

            {/* FAQ */}
            {course.faqs.length ? (
              <BodySection id="faq" eyebrow="Questions" title="Before you enroll">
                <Reveal>
                  <FaqAccordion faqs={course.faqs} />
                </Reveal>
                <p className="mt-6 text-muted">
                  Something else on your mind?{" "}
                  <a
                    href={whatsappLink(`Hi Manisha, I have a question about the ${course.title} course.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={inlineLink}
                  >
                    Ask us on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  .
                </p>
              </BodySection>
            ) : null}
          </div>
        </Container>
      </div>

      {/* Closing enroll band: the sticky bar's destination on phones. */}
      <Section tone="mist" id={ENROLL_ID} aria-labelledby="enroll-title">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-marigold-700">{course.shortTitle}</p>
            <h2 id="enroll-title" className="display-lg mt-4">
              Start whenever you&apos;re ready
            </h2>
            <p className="lede mt-5 max-w-xl text-muted">{course.promise}</p>
            <p className="mt-6 text-muted">
              {pluralise(facts.lessons, "lesson")} · {facts.length} of video · {facts.access} access
            </p>
          </Reveal>
          <Reveal from="right" delay={0.1}>
            <Card className="overflow-hidden">
              <div className="flex items-center gap-4 border-b border-line p-5">
                <CourseCover program={course} className="w-28 shrink-0 rounded-lg" />
                <div>
                  <p className="font-display text-lg leading-tight text-jamun-900">{course.title}</p>
                  {course.price ? (
                    <p className="mt-1 font-display text-2xl leading-none text-jamun-900">
                      <span className="sr-only">Price: </span>
                      {formatINR(course.price.amount)}
                    </p>
                  ) : null}
                </div>
              </div>
              <CourseEnrollPanel program={course} source="course-closing" idPrefix="course-closing" className="p-5 sm:p-6" />
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* More courses */}
      {related.length ? (
        <Section tone="paper" aria-labelledby="more-title">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Reveal>
              <p className="eyebrow text-marigold-700">Keep growing</p>
              <h2 id="more-title" className="display-md mt-3">
                More courses
              </h2>
            </Reveal>
            <ButtonLink href="/courses" variant="link" arrow className="min-h-11">
              See all courses
            </ButtonLink>
          </div>
          <StaggerList className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <StaggerListItem key={c.slug} className="flex">
                <CourseCard program={c} />
              </StaggerListItem>
            ))}
          </StaggerList>
        </Section>
      ) : null}

      <CourseStickyBar program={course} watchId={HERO_CTA_ID} targetId={ENROLL_ID} />
    </>
  );
}

/* ---------- pieces ---------- */

function HeroFact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3.5 py-1.5 text-[0.9375rem]">
      <Icon aria-hidden="true" className="size-4 text-marigold-300" />
      <dt className="sr-only">{label}</dt>
      <dd className="text-white">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="order-2 text-muted">{label}</dt>
      <dd className="order-1 font-display text-3xl leading-none text-jamun-900">
        <Ticker value={value} />
      </dd>
    </div>
  );
}

function BodySection({
  id,
  eyebrow,
  title,
  intro,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line py-12 first:border-t-0 md:py-16">
      <Reveal>
        <p className="eyebrow text-marigold-700">{eyebrow}</p>
        <h2 id={`${id}-title`} className="display-md mt-3">
          {title}
        </h2>
      </Reveal>
      {intro ? <div className="mt-5">{intro}</div> : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}
