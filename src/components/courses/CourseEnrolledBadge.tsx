"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEnrollments } from "@/components/account/StudentProvider";
import { Badge } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";

/**
 * "Enrolled" when the signed-in (demo) student owns the course. Renders
 * nothing on the server and during hydration, so there's no flash.
 */
export function CourseEnrolledBadge({ slug, className }: { slug: string; className?: string }) {
  const { ready, isEnrolled } = useEnrollments();
  const show = ready && isEnrolled(slug);
  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.span
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
          className={cn("inline-flex", className)}
        >
          <Badge tone="peacock">
            <Check aria-hidden="true" className="size-3.5" strokeWidth={3} />
            Enrolled
          </Badge>
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}
