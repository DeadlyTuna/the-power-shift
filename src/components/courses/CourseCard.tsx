import Link from "next/link";
import { ArrowRight, BarChart3, Clock3, PlayCircle } from "lucide-react";
import type { Program } from "@/content/programs";
import { SpotlightCard } from "@/components/programs/SpotlightCard";
import { cn } from "@/lib/cn";
import { formatINR } from "@/lib/format";
import { courseFacts, courseHref, pluralise } from "./course-helpers";
import { CourseCover } from "./CourseCover";
import { CourseEnrolledBadge } from "./CourseEnrolledBadge";

/**
 * One self-paced course in a grid (the /courses catalog, /programs, and the
 * home page). Server-rendered; only the "Enrolled" badge is a client child.
 * The whole card is tappable through the title's stretched link, so there is
 * a single, descriptive link per course for keyboard and screen readers.
 */
export type CourseCardProps = {
  program: Program;
  className?: string;
  /** Heading level for the course title; match the surrounding outline. */
  headingLevel?: "h2" | "h3" | "h4";
};

export function CourseCard({ program, className, headingLevel: Heading = "h3" }: CourseCardProps) {
  const facts = courseFacts(program);
  const category = program.course?.category;

  return (
    <SpotlightCard className={cn("group/course", className)}>
      <div className="relative overflow-hidden rounded-t-[calc(var(--radius-card)-1px)]">
        <CourseCover
          program={program}
          className="transition-transform duration-700 ease-shift group-hover/course:scale-[1.035]"
        />
        <CourseEnrolledBadge slug={program.slug} className="absolute top-3 right-3" />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {category ? <p className="eyebrow text-marigold-700">{category}</p> : null}
        <Heading className="display-sm mt-3">
          <Link
            href={courseHref(program.slug)}
            className="after:absolute after:inset-0 after:rounded-card after:content-[''] hover:text-jamun-700"
          >
            {program.title}
          </Link>
        </Heading>
        <p className="mt-2.5 leading-snug text-muted">{program.promise}</p>

        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.9375rem] text-ink">
          <li className="inline-flex items-center gap-1.5">
            <BarChart3 aria-hidden="true" className="size-4 text-marigold-700" />
            {facts.level}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <PlayCircle aria-hidden="true" className="size-4 text-marigold-700" />
            {pluralise(facts.lessons, "lesson")}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Clock3 aria-hidden="true" className="size-4 text-marigold-700" />
            <span>
              {facts.length}
              <span className="sr-only"> of video</span>
            </span>
          </li>
        </ul>

        <div className="mt-auto pt-6">
          <div className="flex items-end justify-between gap-4 border-t border-line pt-4">
            {program.price ? (
              <p className="font-display text-[1.75rem] leading-none text-jamun-900">
                <span className="sr-only">Price: </span>
                {formatINR(program.price.amount)}
              </p>
            ) : (
              <span />
            )}
            <span aria-hidden="true" className="inline-flex items-center gap-1.5 font-semibold text-jamun-900">
              View course
              <ArrowRight className="size-[1.1em] transition-transform duration-200 ease-shift group-hover/course:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}
