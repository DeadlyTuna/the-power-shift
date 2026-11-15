"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * Scroll-triggered entrance: fades and lifts content into place the first
 * time it enters the viewport. Without JavaScript the content is simply shown
 * (see the [data-reveal] rule in globals.css).
 *
 *   <Reveal>…</Reveal>                 fade up
 *   <Reveal from="left" delay={0.1}>   slide in from the left
 */

type From = "up" | "down" | "left" | "right" | "none";

const offsets: Record<From, { x?: number; y?: number }> = {
  up: { y: 28 },
  down: { y: -28 },
  left: { x: -36 },
  right: { x: 36 },
  none: {},
};

export type RevealProps = HTMLMotionProps<"div"> & {
  from?: From;
  delay?: number;
  /** Fraction of the element that must be visible before it animates. */
  amount?: number;
  /** Add a soft blur that clears as it arrives. */
  blur?: boolean;
};

export function Reveal({ from = "up", delay = 0, amount = 0.2, blur = false, className, ...props }: RevealProps) {
  return (
    <motion.div
      data-reveal=""
      className={cn(className)}
      initial={{ opacity: 0, ...offsets[from], ...(blur ? { filter: "blur(8px)" } : {}) }}
      whileInView={{ opacity: 1, x: 0, y: 0, ...(blur ? { filter: "blur(0px)" } : {}) }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    />
  );
}
