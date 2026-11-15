"use client";

import { useReducedMotion } from "framer-motion";
import { Confetti } from "@/components/kit/confetti";

/**
 * One celebratory confetti burst in the brand palette, fired when mounted.
 * Remount it (change its `key`) to fire again. Renders nothing when the
 * visitor prefers reduced motion. The canvas never takes pointer events.
 */

/** marigold-400, marigold-300, peacock-600, kumkum, jamun-700, marigold-200 */
export const PALETTE_CONFETTI = ["#f2a93b", "#f7c87a", "#0e6b6b", "#c8423a", "#4e2f61", "#fbe3b8"];

export function PaletteConfetti({ origin = { x: 0.5, y: 0.35 } }: { origin?: { x: number; y: number } }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <Confetti
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] size-full"
      globalOptions={{ resize: true, useWorker: false }}
      options={{
        particleCount: 110,
        spread: 78,
        startVelocity: 42,
        ticks: 220,
        scalar: 0.95,
        origin,
        colors: PALETTE_CONFETTI,
        disableForReducedMotion: true,
      }}
    />
  );
}
