"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * The site's one shared, coarse clock for time-dependent UI (event open vs
 * closed, countdowns, status badges). Every component that asks "has this
 * event started?" reads it, so labels, badges, countdowns and forms on a page
 * always flip at the same moment.
 *
 * It ticks every 30 seconds, when the tab becomes visible or the window
 * regains focus, and once just after each watched event's start time (see
 * useEventStatus), so a page left open never shows a stale state.
 *
 * On the server and during hydration it returns `null`, so components render
 * a neutral (or server-provided) state first and switch to the real one right
 * after mount. That keeps statically built pages honest and avoids hydration
 * mismatches.
 */

const TICK_MS = 30_000;
/** setTimeout overflows past ~24.8 days; the 30-second tick covers longer waits. */
const MAX_TIMEOUT = 2_147_483_647;

let now = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  now = Date.now();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    now = Date.now();
    timer = setInterval(tick, TICK_MS);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    }
  };
}

function getSnapshot() {
  if (!now) now = Date.now();
  return now;
}

function getServerSnapshot() {
  return null;
}

/** Current time in ms, refreshed every 30s; `null` until the component has mounted. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Ticks the shared clock one second after `startsAt`, so everything reading it switches together. */
export function useTickAfter(startsAt: string | undefined) {
  useEffect(() => {
    if (!startsAt) return;
    const remaining = new Date(startsAt).getTime() - Date.now();
    if (!(remaining > 0) || remaining + 1000 >= MAX_TIMEOUT) return;
    const id = window.setTimeout(tick, remaining + 1000);
    return () => window.clearTimeout(id);
  }, [startsAt]);
}

export type EventStatus = "pending" | "open" | "closed";

/**
 * Whether a dated event is still open for registration, computed in the
 * browser. Mirrors `isEventOpen()` in src/content/programs.ts: no date means
 * open. "pending" on the server and during hydration.
 */
export function useEventStatus(startsAt: string | undefined): EventStatus {
  const current = useNow();
  useTickAfter(startsAt);
  if (!startsAt) return "open";
  if (current === null) return "pending";
  return new Date(startsAt).getTime() > current ? "open" : "closed";
}

/**
 * The same answer as a boolean, using `serverGuess` until the browser knows:
 * the page's own isEventOpen() result on pages that revalidate, or null when
 * the caller has no fresh server time.
 */
export function useEventOpenOr<T extends boolean | null>(startsAt: string | undefined, serverGuess: T): boolean | T {
  const status = useEventStatus(startsAt);
  return status === "pending" ? serverGuess : status === "open";
}

const noopSubscribe = () => () => {};

/** False on the server and during hydration, true once the component has mounted in the browser. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
