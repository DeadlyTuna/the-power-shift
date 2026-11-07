"use client";

import type { ComponentProps } from "react";
import { useReducedMotion } from "framer-motion";
import { BorderBeam } from "@/components/kit/border-beam";
import { cn } from "@/lib/cn";

/**
 * A white card with a slow marigold-to-peacock light travelling round its
 * border (Magic UI BorderBeam). The beam is left out entirely for visitors
 * who prefer reduced motion.
 */
export function BeamCard({ className, children, ...props }: ComponentProps<"div">) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("relative overflow-hidden rounded-card border border-line bg-white", className)} {...props}>
      {children}
      {reduce ? null : (
        <>
          <BorderBeam
            size={140}
            duration={9}
            borderWidth={2}
            colorFrom="var(--color-marigold-400)"
            colorTo="var(--color-peacock-600)"
          />
          <BorderBeam
            size={140}
            duration={9}
            delay={4.5}
            borderWidth={2}
            colorFrom="var(--color-peacock-600)"
            colorTo="var(--color-marigold-300)"
          />
        </>
      )}
    </div>
  );
}
