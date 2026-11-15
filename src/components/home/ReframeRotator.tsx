"use client";

import { useEffect, useState, useSyncExternalStore, type FocusEvent, type PointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { patterns, statements, type Statement } from "@/content/assessment";
import { BorderBeam } from "@/components/kit/border-beam";
import { Card } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";
import { cn } from "@/lib/cn";

/**
 * The home hero's notebook page: each of the twelve Power Self-Assessment
 * scripts gets struck through and rewritten, one at a time.
 *
 * Accessibility (WCAG 2.2.2 and the APG carousel pattern):
 * - Auto-advances only when prefers-reduced-motion is not set.
 * - Visible Pause/Play, Previous and Next controls.
 * - Pauses while the mouse is over it; keyboard focus entering it pauses it
 *   until the visitor presses Play.
 * - aria-live is "off" while rotating, so screen readers are never
 *   interrupted; once stopped, Previous/Next announce the new statement.
 *
 * Motion: a marigold beam travels round the page while the reframes play
 * (Pause stops it too), and the notebook tilts gently towards a mouse
 * pointer. Neither runs for touch or with reduced motion.
 */

const ADVANCE_MS = 5500;
const TOTAL = statements.length;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const patternNames = new Map(patterns.map((p) => [p.id, p.name]));

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION).matches;
}

/**
 * Server render assumes motion is fine so most visitors don't see the
 * Pause label flip on hydration. Nothing can advance before the browser's
 * real preference is known: timers only start in effects, and the
 * hydration re-render with the real value clears them.
 */
function prefersReducedMotionOnServer() {
  return false;
}

function isKeyboardFocus(target: EventTarget) {
  if (!(target instanceof Element)) return false;
  try {
    return target.matches(":focus-visible");
  } catch {
    // Browsers without :focus-visible: treat all focus as keyboard focus.
    return true;
  }
}

const twoDigits = (n: number) => String(n).padStart(2, "0");

/** Largest tilt, in degrees, when the pointer is at the card's edge. */
const MAX_TILT = 3.5;
const tiltSpring = { stiffness: 140, damping: 18, mass: 0.6 };

function SlideBody({ statement, played, sizer = false }: { statement: Statement; played: boolean; sizer?: boolean }) {
  return (
    <>
      <p className="text-[0.9375rem] font-semibold text-muted">{patternNames.get(statement.pattern)}</p>
      <Reframe
        trigger="controlled"
        active={played}
        size="xl"
        labels={!sizer}
        script={statement.script}
        shift={statement.shift}
        className="mt-3"
      />
    </>
  );
}

const controlClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-line text-jamun-900 transition-colors duration-200 hover:border-jamun-900 hover:bg-paper";

export function ReframeRotator({ className }: { className?: string }) {
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    prefersReducedMotion,
    prefersReducedMotionOnServer,
  );
  const [index, setIndex] = useState(0);
  /** The statement whose strike-and-write has been played. Lags `index` by two frames. */
  const [playedIndex, setPlayedIndex] = useState<number | null>(null);
  /** null until the visitor chooses; until then reduced motion decides. */
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [hovering, setHovering] = useState(false);

  const paused = userPaused ?? reducedMotion;
  const rotating = !paused && !hovering;
  const statement = statements[index];

  // Pointer position over the card, -0.5 (left/top) to 0.5 (right/bottom).
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-MAX_TILT, MAX_TILT]), tiltSpring);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [MAX_TILT, -MAX_TILT]), tiltSpring);

  // Each statement mounts unstruck (key below), then plays once the browser has painted that state.
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setPlayedIndex(index));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [index]);

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % TOTAL), ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [rotating, index]);

  const step = (delta: number) => setIndex((i) => (i + delta + TOTAL) % TOTAL);

  function onFocus(event: FocusEvent<HTMLDivElement>) {
    const from = event.relatedTarget;
    const enteringFromOutside = !(from instanceof Node && event.currentTarget.contains(from));
    if (enteringFromOutside && isKeyboardFocus(event.target)) setUserPaused(true);
  }

  function onPointer(event: PointerEvent<HTMLDivElement>, inside: boolean) {
    if (event.pointerType !== "mouse") return;
    setHovering(inside);
    if (!inside) {
      pointerX.set(0);
      pointerY.set(0);
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  const tilting = hovering && !reducedMotion;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Reframes from the Power Self-Assessment"
      onFocus={onFocus}
      onPointerEnter={(e) => onPointer(e, true)}
      onPointerLeave={(e) => onPointer(e, false)}
      onPointerMove={onPointerMove}
      className={cn("relative", className)}
    >
      <motion.div
        className="relative"
        style={{ rotateX, rotateY, transformPerspective: 1100 }}
        animate={{ y: tilting ? -4 : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
      >
        {/* The next sheet of the pad, peeking out underneath. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 translate-x-1.5 translate-y-2 rotate-[1.4deg] rounded-card border border-line bg-mist sm:translate-x-2.5 sm:translate-y-2.5"
        />

        <Card
          className={cn(
            "relative transition-shadow duration-500 ease-shift",
            tilting && "shadow-[0_28px_60px_-34px_rgba(42,22,54,0.45)]",
          )}
        >
          {paused || reducedMotion ? null : (
            <BorderBeam size={150} duration={9} borderWidth={2} colorFrom="#f2a93b" colorTo="#f7c87a" />
          )}
          {/* Punched holes along the top edge, like a coaching notebook. */}
          <div aria-hidden="true" className="flex justify-between px-7 pt-4 sm:px-10">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="size-2.5 rounded-full bg-paper ring-1 ring-line" />
            ))}
          </div>

          <div className="px-5 pt-5 pb-4 sm:px-9 sm:pt-6 sm:pb-6">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <p className="eyebrow text-[0.75rem] text-marigold-700 sm:text-[0.8125rem]">Power Self-Assessment</p>
              <p aria-hidden="true" className="flex shrink-0 items-baseline gap-1.5 tabular-nums">
                <span className="hidden text-[0.8125rem] text-muted sm:inline">Statement</span>
                <span className="font-display text-xl leading-none text-jamun-900">{twoDigits(index + 1)}</span>
                <span className="text-[0.8125rem] text-muted">/ {TOTAL}</span>
              </p>
            </div>

            {/* Every slide is stacked invisibly in the same cell so the card keeps the height of the longest one. */}
            <div className="grid pt-6 pb-8 sm:pt-8 sm:pb-10">
              {statements.map((s) => (
                <div key={s.id} aria-hidden="true" className="invisible col-start-1 row-start-1">
                  <SlideBody statement={s} played sizer />
                </div>
              ))}
              <div className="col-start-1 row-start-1" aria-live={rotating ? "off" : "polite"} aria-atomic="true">
                <div
                  key={statement.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Statement ${index + 1} of ${TOTAL} from the Power Self-Assessment`}
                >
                  <SlideBody statement={statement} played={playedIndex === index} />
                </div>
              </div>
            </div>

            <div aria-hidden="true" data-print="hide" className="flex items-center gap-1">
              {statements.map((s, i) => (
                <span
                  key={s.id}
                  className={cn(
                    "flex-1 rounded-full transition-colors duration-300",
                    i === index ? "h-1 bg-marigold-400" : cn("h-0.5", i < index ? "bg-jamun-200" : "bg-line"),
                  )}
                />
              ))}
            </div>

            {/* Centred, media-player style; also keeps Next clear of the floating WhatsApp button on phones. */}
            <div data-print="hide" className="mt-4 flex items-center justify-center gap-2">
              <button type="button" onClick={() => step(-1)} aria-label="Previous statement" className={controlClass}>
                <ChevronLeft aria-hidden="true" className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setUserPaused(!paused)}
                className={cn(controlClass, "min-w-[6.5rem] px-4 text-[0.9375rem] font-semibold")}
              >
                {paused ? (
                  <Play aria-hidden="true" className="size-4" />
                ) : (
                  <Pause aria-hidden="true" className="size-4" />
                )}
                <span>
                  {paused ? "Play" : "Pause"}
                  <span className="sr-only"> the reframes</span>
                </span>
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next statement" className={controlClass}>
                <ChevronRight aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
