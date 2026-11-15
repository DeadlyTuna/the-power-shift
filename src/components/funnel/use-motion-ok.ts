"use client";

import { useSyncExternalStore } from "react";

/**
 * Whether it's fine to play a JS-driven animation (counting numbers, gauges,
 * confetti): true in the browser unless the visitor has asked their OS to
 * reduce motion.
 *
 * False on the server and during hydration, so components render their
 * final, static state first (which is also what visitors without JavaScript
 * see) and only switch to the animated version after mount. That keeps the
 * server HTML honest and avoids hydration mismatches.
 *
 * Framer Motion's own components already honour reduced motion through
 * <MotionProvider>; this is for the animations it doesn't cover (springs on
 * text, canvas effects, values that aren't transforms).
 */

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useMotionOK(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !window.matchMedia(QUERY).matches,
    () => false,
  );
}
