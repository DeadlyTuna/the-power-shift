"use client";

import type { Program } from "@/content/programs";
import { useEnrollments } from "@/components/account/StudentProvider";
import { StickyEnrollBar } from "@/components/programs/StickyEnrollBar";
import { formatINR } from "@/lib/format";
import { learnHref } from "./course-helpers";

/**
 * The course page's bottom bar on phones and tablets. It appears once the
 * enroll card has scrolled away and hides at the closing enroll section.
 * Enrolled students get a straight link back into the course instead.
 */
export function CourseStickyBar({
  program,
  watchId,
  targetId,
}: {
  program: Program;
  watchId: string;
  targetId: string;
}) {
  const { ready, isEnrolled } = useEnrollments();
  const enrolled = ready && isEnrolled(program.slug);
  const price = program.price ? formatINR(program.price.amount) : "";

  return (
    <StickyEnrollBar
      watchId={watchId}
      targetId={targetId}
      href={enrolled ? learnHref(program.slug) : `#${targetId}`}
      whatsappMessage={`Hi Manisha, I have a question about the ${program.title} course.`}
      source="course-sticky-bar"
    >
      {enrolled ? "Continue learning" : price ? `Enroll for ${price}` : "Enroll"}
    </StickyEnrollBar>
  );
}
