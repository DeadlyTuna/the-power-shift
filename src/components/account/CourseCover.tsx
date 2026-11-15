import type { CourseDetails } from "@/content/programs";
import { cn } from "@/lib/cn";

/** Palette treatment for each course accent. */
export const accentStyles: Record<
  CourseDetails["accent"],
  { cover: string; ring: string; eyebrow: string; dot: string }
> = {
  marigold: {
    cover: "bg-marigold-200 text-jamun-950",
    ring: "text-marigold-400/70",
    eyebrow: "text-marigold-700",
    dot: "bg-marigold-400",
  },
  peacock: {
    cover: "bg-peacock-50 text-peacock-700",
    ring: "text-peacock-600/25",
    eyebrow: "text-peacock-700",
    dot: "bg-peacock-600",
  },
  jamun: {
    cover: "bg-jamun-900 text-white",
    ring: "text-jamun-700",
    eyebrow: "text-marigold-300",
    dot: "bg-marigold-400",
  },
  kumkum: {
    cover: "bg-kumkum-50 text-jamun-950",
    ring: "text-kumkum/25",
    eyebrow: "text-kumkum",
    dot: "bg-kumkum",
  },
};

/**
 * Small typographic cover for a course: accent colour, category and a few
 * concentric rings (a quiet echo of the "shift"). Decorative only; the course
 * title is always repeated as real text next to it.
 */
export function CourseCover({
  accent,
  category,
  className,
}: {
  accent: CourseDetails["accent"];
  category: string;
  className?: string;
}) {
  const style = accentStyles[accent];
  return (
    <div aria-hidden="true" className={cn("relative isolate overflow-hidden", style.cover, className)}>
      <svg
        viewBox="0 0 200 200"
        className={cn(
          "absolute -right-10 -bottom-12 -z-10 size-48 transition-transform duration-500 ease-shift group-hover:scale-[1.04]",
          style.ring,
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
      >
        <circle cx="100" cy="100" r="35" />
        <circle cx="100" cy="100" r="62" />
        <circle cx="100" cy="100" r="89" />
      </svg>
      <span className={cn("eyebrow absolute top-4 left-4 text-[0.6875rem]", style.eyebrow)}>{category}</span>
      <span className={cn("absolute bottom-4 left-4 size-2.5 rounded-full", style.dot)} />
    </div>
  );
}
