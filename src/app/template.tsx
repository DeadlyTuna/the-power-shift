"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

/**
 * A soft page transition: the page content fades in and rises 10px when a
 * visitor navigates to another section of the site.
 *
 * - Lives in template.tsx, so it wraps only the page inside <main>; the
 *   announcement bar, sticky header, footer and WhatsApp button (all in the
 *   root layout) never move.
 * - The page a visitor lands on is shown as server-rendered, with no fade, so
 *   there's never a blank page while JavaScript loads (or without it). Only
 *   client-side navigations animate.
 * - Only opacity and a small transform, which Framer Motion clears
 *   ("transform: none") as soon as it settles, so fixed and sticky bars inside
 *   pages behave normally. Layout never shifts, so scroll position and focus
 *   handling stay with Next.js.
 * - Reduced motion: MotionConfig drops the rise; the fade is near-instant.
 *
 * The root template remounts when the first URL segment changes (e.g. /about
 * to /programs), not between /programs and /programs/[slug].
 */

let hasHydrated = false;

export default function Template({ children }: { children: ReactNode }) {
  // Decided once per mount: false for the very first page, true afterwards.
  const [animateIn] = useState(() => hasHydrated);

  useEffect(() => {
    hasHydrated = true;
  }, []);

  return (
    <motion.div
      initial={animateIn ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
