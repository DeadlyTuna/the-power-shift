"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The signature element: a limiting script is struck through with a kumkum
 * marker, then the shift is written in by hand underneath.
 *
 * trigger="in-view"     plays once when scrolled into view (default)
 * trigger="controlled"  plays whenever `active` becomes true (for rotators)
 *
 * Without JavaScript, both lines render in their final state. With
 * prefers-reduced-motion, the change is instant.
 */

type Size = "xl" | "lg" | "md";

const scriptSizes: Record<Size, string> = {
  xl: "text-xl sm:text-2xl",
  lg: "text-lg sm:text-xl",
  md: "text-base sm:text-lg",
};

const shiftSizes: Record<Size, string> = {
  xl: "text-[2.125rem] leading-[1.15] sm:text-5xl sm:leading-[1.1]",
  lg: "text-3xl leading-[1.15] sm:text-4xl",
  md: "text-2xl leading-snug sm:text-[1.75rem]",
};

export function Reframe({
  script,
  shift,
  trigger = "in-view",
  active = true,
  size = "lg",
  tone = "light",
  className,
  labels = true,
}: {
  script: string;
  shift: string;
  trigger?: "in-view" | "controlled";
  active?: boolean;
  size?: Size;
  tone?: "light" | "dark";
  className?: string;
  /** Visually hidden "Old script" / "Shift" labels for screen readers. */
  labels?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (trigger !== "in-view") return;
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [trigger]);

  const played = trigger === "controlled" ? active : inView;

  return (
    <div ref={ref} data-reframe="" className={cn("flex flex-col gap-2", className)}>
      <p className={cn(scriptSizes[size], tone === "dark" ? "text-jamun-100" : "text-ink")}>
        {labels ? <span className="sr-only">Old script: </span> : null}
        <s className="reframe-strike" data-struck={played}>
          {script}
        </s>
      </p>
      <p
        className={cn(
          "hand reframe-write",
          shiftSizes[size],
          tone === "dark" ? "text-marigold-300" : "text-peacock-600",
        )}
        data-written={played}
      >
        {labels ? <span className="sr-only">Shift: </span> : null}
        {shift}
      </p>
    </div>
  );
}
