"use client";

import { motion, type Variants } from "framer-motion";

/**
 * "From first call to follow-up": a real sequence, so the steps arrive in
 * order. Each step's rule draws itself in from the left, its marigold node
 * lands, then the words follow. On wide screens the four rules read as one
 * timeline drawn left to right.
 *
 * Without JavaScript everything is shown as-is (data-reveal); with reduced
 * motion the rules appear without drawing and only a short fade remains.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.32, delayChildren: 0.1 } },
};

const step: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } },
};

const rule: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.7, ease: EASE } },
};

const node: Variants = {
  hidden: { scale: 0, opacity: 0 },
  show: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 420, damping: 22 } },
};

const words: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export function EngagementSteps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <motion.ol
      data-reveal=""
      variants={list}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
    >
      {steps.map((s, i) => (
        <motion.li key={s.title} data-reveal="" variants={step} className="relative pt-7">
          <motion.span
            aria-hidden="true"
            data-reveal=""
            variants={rule}
            className="absolute inset-x-0 top-0 h-0.5 origin-left rounded-full bg-jamun-900"
          />
          <motion.span
            aria-hidden="true"
            data-reveal=""
            variants={node}
            className="absolute -top-[5px] left-0 size-3 rounded-full bg-marigold-400 ring-4 ring-paper"
          />
          <motion.div data-reveal="" variants={words}>
            <span aria-hidden="true" className="font-display text-4xl leading-none text-marigold-700">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="display-sm mt-4">{s.title}</h3>
            <p className="mt-3 text-[0.9875rem] text-muted">{s.body}</p>
          </motion.div>
        </motion.li>
      ))}
    </motion.ol>
  );
}
