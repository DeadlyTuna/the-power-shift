"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BorderBeam } from "@/components/kit/border-beam";
import { cn } from "@/lib/cn";

/**
 * Small motion pieces shared by the site's forms (contact, clarity call,
 * corporate enquiry, merch checkout): a quiet light tracing the form card's
 * border, the swap from form to confirmation, and an animated check.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A slow marigold-to-peacock light that travels round its parent's border.
 * The parent needs `relative` and a border radius. Decorative: hidden from
 * assistive tech, for reduced motion and in print.
 */
export function Beam({
  duration = 14,
  size = 140,
  delay = 0,
  reverse = false,
}: {
  duration?: number;
  size?: number;
  delay?: number;
  reverse?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute -inset-px rounded-[inherit] motion-reduce:hidden print:hidden"
    >
      <BorderBeam
        size={size}
        duration={duration}
        delay={delay}
        reverse={reverse}
        borderWidth={1.5}
        colorFrom="var(--color-marigold-400)"
        colorTo="var(--color-peacock-600)"
      />
    </span>
  );
}

/**
 * Cross-fades a form into its confirmation (and back). The confirmation
 * moves focus to its own heading once it has mounted (see useFocusOnMount),
 * because with mode="wait" it only appears after the form has left.
 */
export function FormSwap({ done, form, success }: { done: boolean; form: ReactNode; success: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {done ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {success}
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10, transition: { duration: 0.22, ease: "easeIn" } }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {form}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** A ref that focuses its element once, when the component mounts. */
export function useFocusOnMount<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return ref;
}

/** A peacock badge whose check mark draws itself in. Decorative. */
export function SuccessCheck({ size = "md", className }: { size?: "md" | "lg"; className?: string }) {
  const lg = size === "lg";
  return (
    <motion.span
      aria-hidden="true"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 20 }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-peacock-50 text-peacock-700",
        lg ? "size-14" : "size-12",
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={lg ? "size-8" : "size-7"}
      >
        <motion.circle
          cx="12"
          cy="12"
          r="9.5"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: EASE, delay: 0.1 }}
        />
        <motion.path
          d="m8.25 12.4 2.6 2.6 5-5.25"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.5 }}
        />
      </svg>
    </motion.span>
  );
}
