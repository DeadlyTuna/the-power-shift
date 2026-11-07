import { courseLessons, courseMinutes, formatCourseLength } from "@/content/courses";
import type { Program } from "@/content/programs";

/**
 * Presentation helpers for the self-paced courses (src/content/courses.ts).
 * They only derive labels and links; no facts live here.
 */

export const COURSES_PATH = "/courses";

export function courseHref(slug: string): string {
  return `${COURSES_PATH}/${slug}`;
}

/** The course player in the student's (demo) account. */
export function learnHref(slug: string): string {
  return `/account/courses/${slug}`;
}

/** Sign-up / sign-in that come back to the course afterwards. `next` is a path, never personal data. */
export function signUpHref(slug: string): string {
  return `/account/sign-up?next=${encodeURIComponent(courseHref(slug))}`;
}

export function signInHref(slug: string): string {
  return `/account/sign-in?next=${encodeURIComponent(courseHref(slug))}`;
}

export function pluralise(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

function formatFact(program: Program, label: string): string | undefined {
  return program.format.find((f) => f.label === label)?.value;
}

export type CourseFacts = {
  level: string;
  lessons: number;
  modules: number;
  minutes: number;
  /** "2h 05m" */
  length: string;
  language: string;
  access: string;
  format: string;
  previews: number;
};

export function courseFacts(program: Program): CourseFacts {
  const lessons = courseLessons(program);
  const minutes = courseMinutes(program);
  return {
    level: program.course?.level ?? "All levels",
    lessons: lessons.length,
    modules: program.course?.modules.length ?? 0,
    minutes,
    length: formatCourseLength(minutes),
    language: formatFact(program, "Language") ?? "English",
    access: formatFact(program, "Access") ?? "Lifetime",
    format: formatFact(program, "Format") ?? "Self-paced video course",
    previews: lessons.filter((l) => l.preview).length,
  };
}

/** "All levels · 11 lessons · 1h 47m" */
export function courseMetaLine(program: Program): string {
  const facts = courseFacts(program);
  return [facts.level, pluralise(facts.lessons, "lesson"), facts.length].join(" · ");
}
