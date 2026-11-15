"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Circle, Eye, Lock, Play } from "lucide-react";
import { formatCourseLength } from "@/content/courses";
import type { CourseModule } from "@/content/programs";
import { useEnrollments } from "@/components/account/StudentProvider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/kit/accordion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/kit/dialog";
import { Ripple } from "@/components/kit/ripple";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { pluralise } from "./course-helpers";

/**
 * The course curriculum: modules in an accordion (first one open), lessons
 * with their length. Free preview lessons open a preview dialog; the rest are
 * locked until the (demo) student enrolls, after which completed lessons are
 * ticked. Lock and tick states appear only once the browser knows who is
 * signed in, so nothing flashes.
 */

type PreviewLesson = { title: string; minutes: number; moduleIndex: number; lessonIndex: number };

export function Curriculum({
  slug,
  courseTitle,
  modules,
}: {
  slug: string;
  courseTitle: string;
  modules: CourseModule[];
}) {
  const { ready, get } = useEnrollments();
  const enrollment = ready ? get(slug) : undefined;
  const done = new Set(enrollment?.completedLessons ?? []);
  const [preview, setPreview] = useState<PreviewLesson | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Accordion type="multiple" defaultValue={["module-0"]} className="overflow-hidden rounded-card border border-line bg-white">
        {modules.map((module, mi) => {
          const minutes = module.lessons.reduce((sum, l) => sum + l.minutes, 0);
          return (
            <AccordionItem key={module.title} value={`module-${mi}`} className="border-line">
              <AccordionTrigger className="group/module items-center gap-4 rounded-none px-5 py-4 hover:bg-paper hover:no-underline focus-visible:ring-marigold-400 data-[state=open]:bg-paper sm:px-6 [&>svg]:size-5 [&>svg]:text-jamun-700">
                <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <span className="min-w-0">
                    <span className="eyebrow block text-[0.75rem] text-marigold-700">Module {mi + 1}</span>
                    <span className="mt-1 block font-display text-[1.25rem] leading-snug font-normal text-jamun-900">
                      {module.title}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-normal text-muted">
                    {pluralise(module.lessons.length, "lesson")} · {formatCourseLength(minutes)}
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-0">
                <ol className="divide-y divide-line border-t border-line">
                  {module.lessons.map((lesson, li) => {
                    const complete = done.has(lesson.id);
                    const locked = ready && !enrollment && !lesson.preview;
                    return (
                      <li key={lesson.id} className="flex items-center gap-3.5 px-5 py-3.5 sm:px-6">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
                            complete
                              ? "bg-peacock-600 text-white"
                              : lesson.preview
                                ? "bg-marigold-200 text-jamun-900"
                                : "bg-mist text-jamun-700",
                          )}
                        >
                          {complete ? (
                            <Check className="size-4" strokeWidth={3} />
                          ) : lesson.preview || enrollment ? (
                            <Play className="size-3.5 translate-x-px fill-current" />
                          ) : locked ? (
                            <Lock className="size-3.5" />
                          ) : (
                            <Circle className="size-2.5 fill-current" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 text-[0.9875rem] leading-snug text-ink">
                          <span className="sr-only">
                            Lesson {li + 1}
                            {complete ? ", completed" : locked ? ", available after enrolling" : ""}:{" "}
                          </span>
                          {lesson.title}
                        </span>
                        {lesson.preview ? (
                          <button
                            type="button"
                            onClick={() => {
                              setPreview({ title: lesson.title, minutes: lesson.minutes, moduleIndex: mi, lessonIndex: li });
                              setOpen(true);
                            }}
                            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-marigold-400 bg-marigold-200/60 px-3 text-sm font-semibold text-jamun-900 transition-colors hover:bg-marigold-200"
                          >
                            <Eye aria-hidden="true" className="size-4" />
                            Preview<span className="sr-only">: {lesson.title}</span>
                          </button>
                        ) : null}
                        <span className="w-14 shrink-0 text-right text-sm text-muted tabular-nums">
                          {lesson.minutes} min
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden rounded-(--radius-card) border-line bg-white p-0 text-ink sm:max-w-2xl">
          {preview ? (
            <>
              <LessonPoster preview={preview} courseTitle={courseTitle} />
              <div className="p-6 sm:p-8">
                <DialogHeader className="text-left">
                  <p className="eyebrow text-marigold-700">
                    Free preview · Module {preview.moduleIndex + 1}, lesson {preview.lessonIndex + 1}
                  </p>
                  <DialogTitle className="mt-2 font-display text-[1.625rem] leading-tight font-normal text-jamun-900">
                    {preview.title}
                  </DialogTitle>
                  <DialogDescription className="mt-2 text-[0.9875rem] leading-relaxed text-muted">
                    The preview video for this lesson will appear here. In the full course, every lesson pairs a short
                    video with a practical exercise you can try the same day.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <DialogClose asChild>
                    <Button variant="dark" className="w-full sm:w-auto">
                      Close preview
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

/** A poster-style stand-in for the lesson video: no fake player, just where it will be. */
function LessonPoster({ preview, courseTitle }: { preview: PreviewLesson; courseTitle: string }) {
  return (
    <div
      aria-hidden="true"
      className="relative flex aspect-video flex-col justify-between overflow-hidden bg-jamun-900 p-6 text-white sm:p-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,var(--color-jamun-700),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1.5px)] [background-size:20px_20px]" />
      <Ripple
        mainCircleSize={110}
        numCircles={4}
        mainCircleOpacity={0.3}
        className="text-white/25 [mask-image:none] [&>div]:bg-white/10"
      />
      <p className="relative eyebrow text-marigold-300">{courseTitle}</p>
      <motion.span
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="absolute top-1/2 left-1/2 inline-flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-marigold-400 text-jamun-950 shadow-[0_18px_40px_-12px_rgba(242,169,59,0.6)]"
      >
        <Play className="size-8 translate-x-0.5 fill-current" />
      </motion.span>
      <div className="relative flex items-end justify-between gap-4">
        <p className="max-w-[70%] font-display text-xl leading-tight sm:text-2xl">{preview.title}</p>
        <p className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm tabular-nums">{preview.minutes} min</p>
      </div>
    </div>
  );
}
