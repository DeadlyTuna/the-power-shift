"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { isEventOpen, programs, type Program } from "@/content/programs";
import { AnimatedShinyText } from "@/components/kit/animated-shiny-text";
import { formatShortDate } from "@/lib/format";

/**
 * Announces the next open live event. Computed in the browser so it never
 * goes stale on a statically built page; renders nothing until mounted and
 * nothing at all when no event is open.
 *
 * Because it can only appear after mount, it slides down (height and fade)
 * rather than popping in and shoving the page. A slow shine passes over the
 * event label (Magic UI AnimatedShinyText; stilled by reduced motion).
 */
export function AnnouncementBar() {
  const pathname = usePathname() ?? "/";
  const reduceMotion = useReducedMotion();
  const [next, setNext] = useState<Program | null>(null);

  useEffect(() => {
    const now = new Date();
    const upcoming = programs
      .filter((p) => p.event && isEventOpen(p, now))
      .sort((a, b) => new Date(a.event!.startsAt).getTime() - new Date(b.event!.startsAt).getTime());
    // eslint-disable-next-line react-hooks/set-state-in-effect -- time-dependent, must run on the client
    setNext(upcoming[0] ?? null);
  }, []);

  const href = next ? (next.landingPath ?? `/programs/${next.slug}`) : null;
  const hidden =
    !next?.event || pathname === href || pathname.startsWith("/checkout") || pathname.startsWith("/enroll");

  return (
    <AnimatePresence initial={false}>
      {next?.event && href && !hidden ? (
        <motion.div
          key="announcement"
          data-print="hide"
          className="overflow-hidden bg-jamun-900 text-jamun-100"
          initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={href}
            className="group mx-auto flex max-w-[1200px] items-center justify-center gap-2 px-5 py-2.5 text-center text-[0.9375rem] sm:px-8"
          >
            <AnimatedShinyText
              shimmerWidth={120}
              className="mx-0 max-w-none shrink-0 font-semibold whitespace-nowrap text-marigold-300/85 via-white via-50% motion-reduce:bg-none"
            >
              {next.mode === "free" ? "Free live session" : "Live workshop"}
            </AnimatedShinyText>
            <span aria-hidden="true">·</span>
            <span className="whitespace-nowrap">
              {/* Phones: label + date on one line; the title joins from small tablets up. */}
              <span className="hidden sm:inline">{next.shortTitle}, </span>
              <span className="sr-only sm:hidden">{next.shortTitle}, </span>
              {formatShortDate(next.event.startsAt)}
            </span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 shrink-0 transition-transform duration-200 ease-shift group-hover:translate-x-1"
            />
          </Link>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
