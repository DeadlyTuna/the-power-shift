"use client";

import { motion, type Variants } from "framer-motion";

/**
 * A headline that arrives word by word: each word fades up out of a soft
 * blur. The heading keeps its real text, so screen readers and search
 * engines read it normally; every word carries data-reveal, so without
 * JavaScript the whole line is simply shown.
 *
 *   <WordReveal as="h1" id="home-title" className="display-xl" text="Step into your power." />
 *   <WordReveal as="h2" trigger="view" stagger={0.14} text="Seen, heard and empowered to lead." />
 *
 * trigger="mount" plays on load (heroes); trigger="view" plays once, the
 * first time the heading scrolls into view.
 */

type Tag = "h1" | "h2" | "p";

const tags = { h1: motion.h1, h2: motion.h2, p: motion.p } as const;

const word: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(8px)" },
  show: (duration: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function WordReveal({
  text,
  as = "h2",
  id,
  className,
  trigger = "mount",
  delay = 0,
  stagger = 0.08,
  duration = 0.6,
}: {
  text: string;
  as?: Tag;
  id?: string;
  className?: string;
  trigger?: "mount" | "view";
  /** Seconds before the first word starts. */
  delay?: number;
  /** Seconds between words. */
  stagger?: number;
  /** Seconds each word takes to settle. */
  duration?: number;
}) {
  const Tag = tags[as];
  const words = text.split(/\s+/).filter(Boolean);
  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  return (
    <Tag
      id={id}
      className={className}
      variants={container}
      initial="hidden"
      {...(trigger === "mount" ? { animate: "show" } : { whileInView: "show", viewport: { once: true, amount: 0.6 } })}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <motion.span data-reveal="" variants={word} custom={duration} className="inline-block">
            {w}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
