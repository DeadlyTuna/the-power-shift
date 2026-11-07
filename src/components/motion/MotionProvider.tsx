"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Site-wide Framer Motion settings. reducedMotion="user" makes every motion
 * component skip transform/layout animation when the visitor has asked their
 * OS to reduce motion (opacity fades still run, quickly).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </MotionConfig>
  );
}
