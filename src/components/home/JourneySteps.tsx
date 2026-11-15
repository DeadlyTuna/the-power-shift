"use client";

import type { CSSProperties } from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * The five shifts drawn in sequence, the first time the list scrolls into
 * view. It's a real sequence, so it animates as one: on desktop each step's
 * riser rises, its tread draws to the right, then its words settle; on phones
 * the connecting path draws down from each numbered stop.
 *
 * Lines start at scale 0 and words at opacity 0 behind data-reveal, so
 * without JavaScript the finished staircase is shown. With reduced motion
 * the lines appear at once (MotionConfig skips transforms) and the words
 * simply fade.
 */

const twoDigits = (n: number) => String(n).padStart(2, "0");
const ease = [0.22, 1, 0.36, 1] as const;

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.28, delayChildren: 0.1 } },
};

const step: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const riser: Variants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 0.25, ease } },
};

const tread: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.5, ease } },
};

const path: Variants = {
  hidden: { scaleY: 0 },
  show: { scaleY: 1, transition: { duration: 0.6, ease, delay: 0.25 } },
};

const words: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};

export function JourneySteps({ steps }: { steps: { verb: string; with: string }[] }) {
  const last = steps.length - 1;

  return (
    <motion.ol
      data-reveal=""
      variants={list}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.35 }}
      className="mt-12 lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:grid lg:grid-cols-5 lg:items-end"
    >
      {steps.map((item, i) => {
        const isLast = i === last;
        return (
          <motion.li
            key={item.verb}
            variants={step}
            style={{ "--step": i } as CSSProperties}
            className={cn(
              "relative pb-9 pl-16",
              isLast && "pb-0",
              // The tread is drawn by the span below; the transparent border keeps the original geometry.
              "lg:h-[calc(12rem_+_var(--step)_*_3rem)] lg:border-t-2 lg:border-transparent lg:pt-6 lg:pr-5 lg:pb-0 lg:pl-0",
              i > 0 && "lg:pl-5",
            )}
          >
            {/* Desktop riser: up from the previous (lower) tread to this one. */}
            {i > 0 ? (
              <motion.span
                aria-hidden="true"
                data-reveal=""
                variants={riser}
                className="absolute top-[-2px] left-0 hidden h-[calc(3rem_+_2px)] w-0.5 origin-bottom bg-jamun-900 lg:block"
              />
            ) : null}
            {/* Desktop tread. */}
            <motion.span
              aria-hidden="true"
              data-reveal=""
              variants={tread}
              className={cn(
                "absolute top-[-2px] right-0 left-0 hidden h-0.5 origin-left lg:block",
                isLast ? "bg-marigold-400" : "bg-jamun-900",
              )}
            />

            {/* Phones and tablets: the path down to the next stop. */}
            {!isLast ? (
              <motion.span
                aria-hidden="true"
                data-reveal=""
                variants={path}
                className="absolute top-12 bottom-1 left-[1.3125rem] w-px origin-top bg-line lg:hidden"
              />
            ) : null}

            {/* The number is its own element: on phones it's absolutely placed against the li, which a moving wrapper would break. */}
            <motion.span
              aria-hidden="true"
              data-reveal=""
              variants={words}
              className={cn(
                "absolute top-0 left-0 inline-flex size-11 items-center justify-center rounded-full border font-display text-lg leading-none",
                isLast
                  ? "border-marigold-400 bg-marigold-400 text-jamun-950"
                  : "border-line bg-white text-marigold-700",
                "lg:static lg:size-auto lg:justify-start lg:rounded-none lg:border-0 lg:bg-transparent lg:text-xl lg:text-marigold-700",
              )}
            >
              {twoDigits(i + 1)}
            </motion.span>
            <motion.div data-reveal="" variants={words}>
              <h3 className="pt-1 font-display text-[1.75rem] leading-tight lg:mt-3 lg:pt-0 xl:text-[2rem]">
                {item.verb}
              </h3>
              <p className="mt-1 text-muted lg:text-[0.9875rem] lg:leading-snug">{item.with}</p>
            </motion.div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}
