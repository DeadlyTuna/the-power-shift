"use client";

import { motion } from "framer-motion";
import { BookOpen, LogOut } from "lucide-react";
import { toast } from "sonner";
import { courseLessons, courseMinutes, courses, formatCourseLength, getCourse } from "@/content/courses";
import type { Program } from "@/content/programs";
import { Avatar, AvatarFallback } from "@/components/kit/avatar";
import { DotPattern } from "@/components/kit/dot-pattern";
import { MagicCard } from "@/components/kit/magic-card";
import { NumberTicker } from "@/components/kit/number-ticker";
import { Progress } from "@/components/kit/progress";
import { Separator } from "@/components/kit/separator";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, Section } from "@/components/ui/Layout";
import { ACCOUNT_HOME } from "@/lib/demo-auth/next-path";
import { CourseCover } from "./CourseCover";
import { DemoNote } from "./AuthCard";
import { useEnrollments, type Enrollment, type Student } from "./StudentProvider";
import { firstName, formatMonthYear, formatPhone, initials } from "./student-utils";
import { useRequireStudent } from "./useRequireStudent";

const progressTone = "bg-mist [&_[data-slot=progress-indicator]]:bg-peacock-600";

type EnrolledCourse = {
  course: Program;
  enrollment: Enrollment;
  total: number;
  done: number;
  minutesDone: number;
  nextLesson?: { title: string };
};

function summarise(enrollment: Enrollment): EnrolledCourse | null {
  const course = getCourse(enrollment.slug);
  if (!course?.course) return null;
  const lessons = courseLessons(course);
  const completed = new Set(enrollment.completedLessons);
  const doneLessons = lessons.filter((l) => completed.has(l.id));
  return {
    course,
    enrollment,
    total: lessons.length,
    done: doneLessons.length,
    minutesDone: doneLessons.reduce((sum, l) => sum + l.minutes, 0),
    nextLesson: lessons.find((l) => !completed.has(l.id)),
  };
}

/** "My courses": the signed-in student's enrolled courses, profile and sign-out. */
export function AccountDashboard() {
  const { ready, student, signOut } = useRequireStudent(ACCOUNT_HOME);
  const { enrollments } = useEnrollments();

  if (!ready || !student) return <DashboardSkeleton />;

  const enrolled = enrollments
    .map(summarise)
    .filter((x): x is EnrolledCourse => x !== null)
    .sort((a, b) => b.enrollment.enrolledAt.localeCompare(a.enrollment.enrolledAt));
  const more = courses.filter((c) => !enrolled.some((e) => e.course.slug === c.slug)).slice(0, 3);
  const first = firstName(student.name);

  return (
    <>
      <Section tone="paper" className="pt-10 pb-16 md:pt-14 md:pb-20">
        <Reveal from="up" blur>
          <p className="eyebrow text-marigold-700">My courses</p>
          <h1 className="display-lg mt-3">{enrolled.length ? `Welcome back, ${first}` : `Welcome, ${first}`}</h1>
          <p className="lede mt-4 max-w-2xl text-muted">
            {enrolled.length
              ? "Pick up where you left off. Your progress is saved as you mark lessons complete."
              : "Your student account is ready. Choose a course to begin."}
          </p>
        </Reveal>

        {enrolled.length ? <Stats enrolled={enrolled} /> : null}

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
          <section aria-labelledby="enrolled-heading">
            <h2 id="enrolled-heading" className="display-sm">
              Enrolled courses
            </h2>
            {enrolled.length ? (
              <Stagger className="mt-5 grid gap-5 md:grid-cols-2" stagger={0.1}>
                {enrolled.map((item) => (
                  <StaggerItem key={item.course.slug} whileHover={{ y: -4 }} className="h-full">
                    <EnrolledCourseCard item={item} />
                  </StaggerItem>
                ))}
              </Stagger>
            ) : (
              <EmptyState />
            )}
          </section>

          <Reveal from="right" delay={0.1}>
            <ProfileCard
              student={student}
              onSignOut={() => {
                signOut();
                toast("You're signed out", { description: "Your demo account and progress stay in this browser." });
              }}
            />
          </Reveal>
        </div>
      </Section>

      {more.length ? (
        <Section tone="white" className="py-16 md:py-20" aria-labelledby="more-heading">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-marigold-700">Keep growing</p>
              <h2 id="more-heading" className="display-md mt-3">
                {enrolled.length ? "More courses" : "Courses to start with"}
              </h2>
            </div>
            <ButtonLink href="/courses" variant="link" arrow className="self-start sm:self-auto">
              See all courses
            </ButtonLink>
          </div>
          <Stagger className="mt-8 grid gap-5 md:grid-cols-3" stagger={0.08}>
            {more.map((course) => (
              <StaggerItem key={course.slug} whileHover={{ y: -4 }} className="h-full">
                <MoreCourseCard course={course} />
              </StaggerItem>
            ))}
          </Stagger>
        </Section>
      ) : null}
    </>
  );
}

function Stats({ enrolled }: { enrolled: EnrolledCourse[] }) {
  const lessonsDone = enrolled.reduce((sum, e) => sum + e.done, 0);
  const minutesDone = enrolled.reduce((sum, e) => sum + e.minutesDone, 0);
  const items = [
    { value: enrolled.length, label: enrolled.length === 1 ? "Course enrolled" : "Courses enrolled" },
    { value: lessonsDone, label: lessonsDone === 1 ? "Lesson complete" : "Lessons complete" },
    { value: minutesDone, label: "Minutes of lessons complete" },
  ];
  return (
    <Stagger className="mt-8 grid grid-cols-3 gap-3 sm:max-w-2xl sm:gap-4" stagger={0.08}>
      {items.map((item) => (
        <StaggerItem key={item.label} className="rounded-2xl border border-line bg-white px-4 py-4 sm:px-5">
          <p className="font-display text-3xl leading-none text-jamun-900 sm:text-4xl">
            <NumberTicker value={item.value} className="tracking-normal text-jamun-900" aria-hidden="true" />
            <span className="sr-only">{item.value}</span>
          </p>
          <p className="mt-2 text-sm leading-snug text-muted">{item.label}</p>
        </StaggerItem>
      ))}
    </Stagger>
  );
}

function EnrolledCourseCard({ item }: { item: EnrolledCourse }) {
  const { course, total, done, nextLesson } = item;
  const details = course.course!;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const cta = done === 0 ? "Start course" : done === total ? "Review course" : "Continue";

  return (
    <MagicCard
      className="h-full rounded-card"
      gradientSize={260}
      gradientFrom="#f2a93b"
      gradientTo="#d9cde3"
      gradientColor="#fbe3b8"
      gradientOpacity={0.3}
    >
      <article className="group flex h-full flex-col">
        <CourseCover accent={details.accent} category={details.category} className="h-24" />
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="font-display text-[1.375rem] leading-tight text-jamun-900">{course.title}</h3>
          <p className="mt-1.5 text-sm text-muted">
            {details.level} · {total} lessons · {formatCourseLength(courseMinutes(course))}
          </p>

          <div className="mt-5">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-semibold text-jamun-900">
                {done} of {total} lessons
              </span>
              <span className="text-muted">{percent}%</span>
            </div>
            <Progress value={percent} aria-label={`${course.shortTitle}: progress`} className={`mt-2 h-2 ${progressTone}`} />
          </div>

          <p className="mt-4 text-[0.9375rem] leading-snug text-muted">
            {nextLesson ? (
              <>
                <span className="font-semibold text-ink">Up next:</span> {nextLesson.title}
              </>
            ) : (
              <span className="font-semibold text-peacock-700">Course complete. Well done.</span>
            )}
          </p>

          <div className="mt-auto pt-6">
            <ButtonLink href={`/account/courses/${course.slug}`} variant="dark" size="sm" arrow>
              {cta}
              <span className="sr-only">: {course.title}</span>
            </ButtonLink>
          </div>
        </div>
      </article>
    </MagicCard>
  );
}

function MoreCourseCard({ course }: { course: Program }) {
  const details = course.course!;
  const lessons = courseLessons(course).length;
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow duration-300 hover:shadow-[0_18px_40px_-28px_rgba(42,22,54,0.5)]">
      <CourseCover accent={details.accent} category={details.category} className="h-20" />
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-tight text-jamun-900">{course.title}</h3>
        <p className="mt-2 text-[0.9375rem] leading-snug text-muted">{course.promise}</p>
        <p className="mt-3 text-sm text-muted">
          {lessons} lessons · {formatCourseLength(courseMinutes(course))}
        </p>
        <div className="mt-auto pt-5">
          <ButtonLink href={`/courses/${course.slug}`} variant="link" arrow>
            View course
            <span className="sr-only">: {course.title}</span>
          </ButtonLink>
        </div>
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <Reveal from="up" className="mt-5">
      <div className="relative isolate overflow-hidden rounded-card border border-dashed border-jamun-200 bg-white px-6 py-10 sm:px-10 sm:py-12">
        <DotPattern
          width={20}
          height={20}
          className="-z-10 text-jamun-200 [mask-image:radial-gradient(60%_70%_at_100%_0%,#000,transparent)]"
        />
        <motion.span
          initial={{ rotate: -8, scale: 0.9 }}
          whileInView={{ rotate: 0, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex size-14 items-center justify-center rounded-2xl bg-marigold-200 text-jamun-900"
        >
          <BookOpen aria-hidden="true" className="size-7" />
        </motion.span>
        <h3 className="display-sm mt-5">You haven&rsquo;t enrolled in a course yet</h3>
        <p className="mt-3 max-w-lg text-muted">
          Browse the self-paced courses, watch a free preview lesson, and enrol when you&rsquo;re ready. Your courses
          and progress will show up here.
        </p>
        <ButtonLink href="/courses" size="lg" arrow className="mt-7">
          Browse courses
        </ButtonLink>
      </div>
    </Reveal>
  );
}

function ProfileCard({ student, onSignOut }: { student: Student; onSignOut: () => void }) {
  const since = formatMonthYear(student.createdAt);
  return (
    <Card className="p-6 lg:sticky lg:top-24">
      <h2 className="sr-only">Your profile</h2>
      <div className="flex items-center gap-4">
        <Avatar className="size-14">
          <AvatarFallback className="bg-jamun-900 text-lg font-semibold text-white">
            {initials(student.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-semibold text-jamun-900">{student.name}</p>
          {since ? <p className="text-sm text-muted">Student since {since}</p> : null}
        </div>
      </div>
      <dl className="mt-6 flex flex-col gap-4 text-[0.9375rem]">
        <div>
          <dt className="text-sm text-muted">Email</dt>
          <dd className="break-words text-ink">{student.email}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Mobile</dt>
          <dd className="text-ink">{formatPhone(student.phone)}</dd>
        </div>
      </dl>
      <Separator className="my-6" />
      <Button variant="outline" size="sm" icon={<LogOut aria-hidden="true" />} onClick={onSignOut} className="w-full">
        Sign out
      </Button>
      <DemoNote className="mt-6 text-sm" />
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <Section tone="paper" className="pt-10 pb-20 md:pt-14" aria-busy="true">
      <p className="eyebrow text-marigold-700">My courses</p>
      <div aria-hidden="true">
        <div className="mt-4 h-12 w-72 max-w-full animate-pulse rounded-xl bg-mist" />
        <div className="mt-5 h-5 w-96 max-w-full animate-pulse rounded bg-mist" />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:max-w-[calc(100%-22rem)]">
          {[0, 1].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-card bg-mist" />
          ))}
        </div>
      </div>
      <p className="sr-only">Loading your courses</p>
      <noscript>
        <p className="mt-6 font-medium text-kumkum">
          The demo student area needs JavaScript. Turn it on in your browser settings, then reload this page.
        </p>
      </noscript>
    </Section>
  );
}
