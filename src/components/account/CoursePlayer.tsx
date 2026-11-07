"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, type Variants } from "framer-motion";
import { ArrowLeft, Check, ChevronRight, Clock, ListVideo, Lock, PartyPopper, Play, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCourse } from "@/content/courses";
import type { CourseModule, Program } from "@/content/programs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/kit/accordion";
import { Confetti, type ConfettiRef } from "@/components/kit/confetti";
import { DotPattern } from "@/components/kit/dot-pattern";
import { Highlighter } from "@/components/kit/highlighter";
import { Progress } from "@/components/kit/progress";
import { ScrollArea } from "@/components/kit/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/kit/sheet";
import { Reveal } from "@/components/motion/Reveal";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge, Card, Section } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";
import { useEnrollments, type Enrollment } from "./StudentProvider";
import { useRequireStudent } from "./useRequireStudent";

/**
 * The demo course player at /account/courses/[slug]: signed-in and enrolled
 * students only. The current lesson lives in local state and is mirrored to
 * ?lesson=<id> so a refresh or shared link opens the same lesson.
 */

const progressTone = "bg-mist [&_[data-slot=progress-indicator]]:bg-peacock-600";
const confettiColors = ["#f2a93b", "#f7c87a", "#0e6b6b", "#c8423a", "#4e2f61", "#fbe3b8"];

type FlatLesson = CourseModule["lessons"][number] & { moduleIndex: number; moduleTitle: string; number: number };

const moduleKey = (index: number) => `module-${index}`;

export function CoursePlayer({ slug }: { slug: string }) {
  const course = getCourse(slug);
  const { ready, student } = useRequireStudent(`/account/courses/${slug}`);
  const { get } = useEnrollments();

  if (!course?.course) return null;
  if (!ready || !student) return <PlayerSkeleton title={course.title} />;
  const enrollment = get(slug);
  if (!enrollment) return <NotEnrolled course={course} />;
  return <PlayerBody course={course} enrollment={enrollment} />;
}

function PlayerBody({ course, enrollment }: { course: Program; enrollment: Enrollment }) {
  const details = course.course!;
  const pathname = usePathname() ?? `/account/courses/${course.slug}`;
  const urlLesson = useSearchParams().get("lesson");
  const { setLessonComplete } = useEnrollments();

  const [selected, setSelected] = useState<string | null>(null);
  const [openModules, setOpenModules] = useState<string[] | null>(null);
  const [direction, setDirection] = useState(1);
  const [reviewing, setReviewing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [justCompleted, setJustCompleted] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const confetti = useRef<ConfettiRef>(null);
  const celebrated = useRef(false);
  const focusStageOnClose = useRef(false);

  const lessons: FlatLesson[] = details.modules
    .flatMap((m, moduleIndex) => m.lessons.map((l) => ({ ...l, moduleIndex, moduleTitle: m.title })))
    .map((l, i) => ({ ...l, number: i + 1 }));
  const total = lessons.length;
  const completed = new Set(enrollment.completedLessons);
  const doneCount = lessons.filter((l) => completed.has(l.id)).length;
  const allDone = total > 0 && doneCount === total;
  const firstUnfinished = lessons.find((l) => !completed.has(l.id));

  const isLesson = (id: string | null): id is string => Boolean(id && lessons.some((l) => l.id === id));
  const currentId = isLesson(selected) ? selected : isLesson(urlLesson) ? urlLesson : (firstUnfinished ?? lessons[0]).id;
  const index = lessons.findIndex((l) => l.id === currentId);
  const lesson = lessons[index];
  const lessonDone = completed.has(lesson.id);
  const open = openModules ?? [moduleKey(lesson.moduleIndex)];
  const showCompletion = allDone && !reviewing;

  function goTo(id: string) {
    const target = lessons.find((l) => l.id === id);
    if (!target) return;
    setDirection(target.number >= lesson.number ? 1 : -1);
    setSelected(id);
    setReviewing(true);
    setOpenModules((prev) => {
      const base = prev ?? [moduleKey(lesson.moduleIndex)];
      const key = moduleKey(target.moduleIndex);
      return base.includes(key) ? base : [...base, key];
    });
    setAnnouncement(`Lesson ${target.number} of ${total}: ${target.title}`);
    window.history.replaceState(null, "", `${pathname}?lesson=${encodeURIComponent(id)}`);
  }

  function setComplete(done: boolean) {
    setSelected(lesson.id);
    setLessonComplete(course.slug, lesson.id, done);
    const nowDone = doneCount + (done ? 1 : -1);
    if (done && nowDone === total) {
      setReviewing(false);
      setJustCompleted(true);
      setAnnouncement(`Lesson complete. You've finished every lesson in ${course.title}.`);
      if (!celebrated.current) {
        celebrated.current = true;
        const burst = { particleCount: 80, spread: 70, startVelocity: 48, ticks: 220, colors: confettiColors };
        void confetti.current?.fire({ ...burst, angle: 60, origin: { x: 0.15, y: 0.75 } });
        void confetti.current?.fire({ ...burst, angle: 120, origin: { x: 0.85, y: 0.75 } });
      }
    } else {
      setAnnouncement(
        done
          ? `Lesson marked complete. ${nowDone} of ${total} lessons complete.`
          : `Lesson marked as not complete. ${nowDone} of ${total} lessons complete.`,
      );
    }
  }

  const curriculumProps = {
    modules: details.modules,
    currentId,
    completed,
    open,
    onOpenChange: setOpenModules,
  };

  const next = lessons[index + 1];
  const previous = lessons[index - 1];

  return (
    <Section tone="paper" className="pt-6 pb-20 md:pt-10 md:pb-24">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <li>
            <Link
              href="/account"
              className="inline-flex min-h-11 items-center underline decoration-marigold-400 decoration-2 underline-offset-4 hover:text-jamun-900"
            >
              My courses
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4" />
          </li>
          <li aria-current="page" className="truncate font-medium text-ink">
            {course.shortTitle}
          </li>
        </ol>
      </nav>

      <Reveal from="up" className="mt-2 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div>
          <p className="eyebrow text-marigold-700">
            {details.category} · {details.level}
          </p>
          <h1 className="display-md mt-2">{course.title}</h1>
        </div>
        <OverallProgress done={doneCount} total={total} className="lg:w-80 lg:shrink-0" />
      </Reveal>

      <div className="mt-6 lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" icon={<ListVideo aria-hidden="true" />} className="w-full">
              Course contents
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            showCloseButton={false}
            className="w-[88vw] gap-0 bg-paper p-0 sm:max-w-sm"
            onCloseAutoFocus={(event) => {
              if (!focusStageOnClose.current) return;
              focusStageOnClose.current = false;
              event.preventDefault();
              stageRef.current?.focus();
            }}
          >
            <SheetHeader className="gap-1 border-b border-line p-5">
              <div className="flex items-start justify-between gap-3">
                <SheetTitle className="font-display text-xl font-normal text-jamun-900">Course contents</SheetTitle>
                <SheetClose asChild>
                  <button
                    type="button"
                    aria-label="Close course contents"
                    className="-mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-jamun-900 hover:bg-mist"
                  >
                    <X aria-hidden="true" className="size-5" />
                  </button>
                </SheetClose>
              </div>
              <SheetDescription className="text-sm text-muted">
                {doneCount} of {total} lessons complete
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-3 py-2">
              <Curriculum
                {...curriculumProps}
                layoutGroup="sheet"
                onSelect={(id) => {
                  goTo(id);
                  focusStageOnClose.current = true;
                  setSheetOpen(false);
                }}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-6 grid gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        <div className="min-w-0">
          {showCompletion ? (
            <CompletionPanel
              course={course}
              total={total}
              autoFocus={justCompleted}
              onReview={() => {
                setReviewing(true);
                requestAnimationFrame(() => stageRef.current?.focus());
              }}
            />
          ) : (
            <>
              <section
                ref={stageRef}
                tabIndex={-1}
                aria-label="Current lesson"
                className="relative isolate min-h-[17rem] overflow-hidden rounded-card bg-jamun-900 text-jamun-100 sm:aspect-video sm:min-h-0"
              >
                <DotPattern
                  width={24}
                  height={24}
                  className="-z-10 text-jamun-700 [mask-image:radial-gradient(80%_70%_at_100%_0%,#000,transparent)]"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-28 -left-20 -z-10 size-80 rounded-full bg-marigold-400/15 blur-3xl"
                />
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  <motion.div
                    key={lesson.id}
                    custom={direction}
                    variants={stageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="relative flex h-full flex-col justify-between gap-8 p-6 sm:p-10"
                  >
                    <div>
                      <p className="eyebrow text-marigold-300">
                        Module {lesson.moduleIndex + 1} · {lesson.moduleTitle}
                      </p>
                      <h2 className="display-md mt-3 max-w-2xl text-white">{lesson.title}</h2>
                      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.9375rem] text-jamun-100">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock aria-hidden="true" className="size-4" />
                          {lesson.minutes} min
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Lesson {lesson.number} of {total}
                        </span>
                        {lesson.preview ? (
                          <Badge tone="marigold" className="text-xs">
                            Free preview
                          </Badge>
                        ) : null}
                        {lessonDone ? (
                          <Badge tone="peacock" className="text-xs">
                            <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
                            Complete
                          </Badge>
                        ) : null}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white">
                        <Play aria-hidden="true" className="ml-0.5 size-6" />
                      </span>
                      <p className="text-[0.9375rem] leading-snug text-jamun-100">
                        The lesson video will appear here.
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </section>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <CompleteToggle done={lessonDone} onChange={setComplete} />
                <div className="grid grid-cols-2 gap-3 sm:flex">
                  <Button
                    variant="outline"
                    icon={<ArrowLeft aria-hidden="true" />}
                    disabled={!previous}
                    onClick={() => previous && goTo(previous.id)}
                  >
                    Previous lesson
                  </Button>
                  {next ? (
                    <Button variant={lessonDone ? "primary" : "dark"} arrow onClick={() => goTo(next.id)}>
                      Next lesson
                    </Button>
                  ) : firstUnfinished && firstUnfinished.id !== lesson.id ? (
                    <Button variant={lessonDone ? "primary" : "dark"} arrow onClick={() => goTo(firstUnfinished.id)}>
                      Next unfinished
                    </Button>
                  ) : (
                    <Button variant="dark" arrow disabled>
                      Next lesson
                    </Button>
                  )}
                </div>
              </div>

              <p className="mt-6 text-sm text-muted">
                Demo course: lesson videos and worksheets will be added before launch. Your progress is saved in this
                browser.
              </p>
            </>
          )}
        </div>

        <aside aria-labelledby="contents-heading" className="hidden lg:block">
          <div className="sticky top-24 overflow-hidden rounded-card border border-line bg-white">
            <div className="border-b border-line px-5 py-4">
              <h2 id="contents-heading" className="font-display text-xl text-jamun-900">
                Course contents
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                {details.modules.length} modules · {total} lessons
              </p>
            </div>
            <ScrollArea className="[&>[data-slot=scroll-area-viewport]]:max-h-[calc(100dvh-14rem)]">
              <div className="px-3 py-2">
                <Curriculum {...curriculumProps} layoutGroup="aside" onSelect={goTo} />
              </div>
            </ScrollArea>
          </div>
        </aside>
      </div>

      <Confetti
        ref={confetti}
        manualstart
        globalOptions={{ resize: true, useWorker: false, disableForReducedMotion: true }}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] size-full"
      />
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </Section>
  );
}

const stageVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: 28 * direction }),
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: (direction: number) => ({ opacity: 0, x: -28 * direction, transition: { duration: 0.2 } }),
};

function OverallProgress({ done, total, className }: { done: number; total: number; className?: string }) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className={cn("rounded-2xl border border-line bg-white px-4 py-3.5", className)}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-semibold text-jamun-900">
          {done} of {total} lessons complete
        </span>
        <span className="text-muted">{percent}%</span>
      </div>
      <Progress value={percent} aria-label="Course progress" className={cn("mt-2 h-2", progressTone)} />
    </div>
  );
}

/** "Mark as complete" as a real checkbox, styled as a pill. */
function CompleteToggle({ done, onChange }: { done: boolean; onChange: (done: boolean) => void }) {
  return (
    <label
      className={cn(
        "inline-flex min-h-12 cursor-pointer items-center gap-3 rounded-full border px-5 py-2.5 font-semibold transition-colors duration-200 select-none",
        "has-[:focus-visible]:shadow-[0_0_0_5px_var(--color-marigold-400)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-jamun-900",
        done
          ? "border-peacock-600 bg-peacock-50 text-peacock-700"
          : "border-jamun-900/25 bg-white text-jamun-900 hover:border-jamun-900",
      )}
    >
      <input type="checkbox" className="sr-only" checked={done} onChange={(e) => onChange(e.target.checked)} />
      <motion.span
        aria-hidden="true"
        animate={done ? { scale: [1, 1.18, 1] } : { scale: 1 }}
        transition={{ duration: 0.35 }}
        className={cn(
          "inline-flex size-6 items-center justify-center rounded-full border-2 transition-colors duration-200",
          done ? "border-peacock-600 bg-peacock-600 text-white" : "border-jamun-200 bg-white",
        )}
      >
        <AnimatePresence initial={false}>
          {done ? (
            <motion.span
              key="tick"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              <Check className="size-4" strokeWidth={3} />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.span>
      Mark as complete
    </label>
  );
}

function Curriculum({
  modules,
  currentId,
  completed,
  open,
  onOpenChange,
  onSelect,
  layoutGroup,
}: {
  modules: CourseModule[];
  currentId: string;
  completed: Set<string>;
  open: string[];
  onOpenChange: (value: string[]) => void;
  onSelect: (id: string) => void;
  /** Separate shared-layout ids for the sidebar and the mobile sheet. */
  layoutGroup: string;
}) {
  return (
    <LayoutGroup id={layoutGroup}>
      <Accordion type="multiple" value={open} onValueChange={onOpenChange}>
        {modules.map((m, mi) => {
          const done = m.lessons.filter((l) => completed.has(l.id)).length;
          return (
            <AccordionItem key={m.title} value={moduleKey(mi)} className="border-line">
              <AccordionTrigger className="items-center px-2 py-3.5 hover:no-underline focus-visible:ring-0 [&>svg]:text-jamun-900">
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="eyebrow text-[0.6875rem] text-marigold-700">Module {mi + 1}</span>
                  <span className="text-[0.9875rem] leading-snug font-semibold text-jamun-900">{m.title}</span>
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                    done === m.lessons.length ? "bg-peacock-50 text-peacock-700" : "bg-mist text-muted",
                  )}
                >
                  {done}/{m.lessons.length}
                  <span className="sr-only"> lessons complete</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <ol className="flex flex-col gap-0.5">
                  {m.lessons.map((l) => {
                    const isCurrent = l.id === currentId;
                    const isDone = completed.has(l.id);
                    return (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(l.id)}
                          aria-current={isCurrent ? "true" : undefined}
                          className={cn(
                            "relative isolate flex min-h-11 w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                            isCurrent ? "text-jamun-900" : "text-ink hover:bg-paper",
                          )}
                        >
                          {isCurrent ? (
                            <motion.span
                              layoutId="current-lesson"
                              aria-hidden="true"
                              transition={{ type: "spring", stiffness: 420, damping: 36 }}
                              className="absolute inset-0 -z-10 rounded-xl bg-mist ring-1 ring-jamun-200"
                            />
                          ) : null}
                          <span
                            aria-hidden="true"
                            className={cn(
                              "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                              isDone
                                ? "border-peacock-600 bg-peacock-600 text-white"
                                : isCurrent
                                  ? "border-marigold-500 bg-white"
                                  : "border-jamun-200 bg-white",
                            )}
                          >
                            {isDone ? <Check className="size-3" strokeWidth={3.5} /> : null}
                          </span>
                          <span className={cn("min-w-0 flex-1 text-[0.9375rem] leading-snug", isCurrent && "font-semibold")}>
                            {l.title}
                            {isDone ? <span className="sr-only"> (complete)</span> : null}
                          </span>
                          <span className="shrink-0 text-sm text-muted">{l.minutes} min</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </LayoutGroup>
  );
}

function CompletionPanel({
  course,
  total,
  autoFocus,
  onReview,
}: {
  course: Program;
  total: number;
  autoFocus: boolean;
  onReview: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (autoFocus) heading.current?.focus();
  }, [autoFocus]);

  return (
    <motion.section
      aria-labelledby="completion-heading"
      initial={{ opacity: 0, scale: 0.97, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative isolate overflow-hidden rounded-card bg-jamun-900 p-7 text-jamun-100 sm:p-12"
    >
      <DotPattern
        width={22}
        height={22}
        className="-z-10 text-jamun-700 [mask-image:radial-gradient(70%_70%_at_100%_0%,#000,transparent)]"
      />
      <div aria-hidden="true" className="absolute -right-24 -bottom-24 -z-10 size-80 rounded-full bg-marigold-400/20 blur-3xl" />
      <motion.span
        initial={{ rotate: -12, scale: 0.6 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
        className="inline-flex size-14 items-center justify-center rounded-2xl bg-marigold-400 text-jamun-950"
      >
        <PartyPopper aria-hidden="true" className="size-7" />
      </motion.span>
      <p className="eyebrow mt-6 text-marigold-300">Course complete</p>
      <h2 id="completion-heading" ref={heading} tabIndex={-1} className="display-md mt-3 max-w-2xl text-white">
        You&rsquo;ve{" "}
        <Highlighter action="underline" color="#f2a93b" strokeWidth={2.5} padding={1}>
          finished
        </Highlighter>{" "}
        {course.title}
      </h2>
      <p className="mt-4 max-w-xl text-jamun-100">
        All {total} lessons are marked complete. Come back to any lesson whenever you&rsquo;d like a refresher.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <ButtonLink href="/account" size="lg" arrow>
          Back to my courses
        </ButtonLink>
        <ButtonLink href="/courses" variant="on-dark" size="lg">
          Browse more courses
        </ButtonLink>
        <Button
          variant="link"
          onClick={onReview}
          className="min-h-11 self-start text-white decoration-marigold-300 hover:decoration-white sm:self-auto"
        >
          Review lessons
        </Button>
      </div>
    </motion.section>
  );
}

function NotEnrolled({ course }: { course: Program }) {
  const total = course.course!.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  return (
    <Section tone="paper" className="pt-10 pb-20 md:pt-16 md:pb-28">
      <Reveal from="up">
        <Card className="relative mx-auto max-w-2xl overflow-hidden p-8 text-center sm:p-12">
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-2xl bg-mist text-jamun-900">
            <Lock aria-hidden="true" className="size-6" />
          </span>
          <p className="eyebrow mt-6 text-marigold-700">{course.course!.category}</p>
          <h1 className="display-md mt-3">You&rsquo;re not enrolled in this course yet</h1>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            Enrol in {course.title} to unlock all {total} lessons and keep track of your progress here.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href={`/courses/${course.slug}`} size="lg" arrow>
              See course details
            </ButtonLink>
            <ButtonLink href="/account" variant="outline" size="lg">
              Back to my courses
            </ButtonLink>
          </div>
        </Card>
      </Reveal>
    </Section>
  );
}

function PlayerSkeleton({ title }: { title: string }) {
  return (
    <Section tone="paper" className="pt-6 pb-20 md:pt-10" aria-busy="true">
      <p className="eyebrow mt-4 text-marigold-700">My courses</p>
      <h1 className="display-md mt-2">{title}</h1>
      <div aria-hidden="true" className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="aspect-video animate-pulse rounded-card bg-mist" />
        <div className="hidden h-96 animate-pulse rounded-card bg-mist lg:block" />
      </div>
      <p className="sr-only">Loading your course</p>
      <noscript>
        <p className="mt-6 font-medium text-kumkum">
          The demo student area needs JavaScript. Turn it on in your browser settings, then reload this page.
        </p>
      </noscript>
    </Section>
  );
}
