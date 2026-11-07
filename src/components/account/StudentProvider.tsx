"use client";

import { useCallback, useSyncExternalStore } from "react";
import * as demoStore from "@/lib/demo-auth/store";
import type { Enrollment, Student } from "@/lib/demo-auth/store";
import * as supabaseStore from "@/lib/auth/supabase-store";
import { authMode } from "@/lib/supabase/env";

/** Real Supabase accounts when configured, otherwise the browser-only demo. */
const store = authMode === "supabase" ? supabaseStore : demoStore;

/** "supabase" (real accounts) or "demo" (browser-only); decided at build time from env vars. */
export { authMode };

/**
 * React bindings for student accounts: real Supabase accounts
 * (src/lib/auth/supabase-store.ts) when NEXT_PUBLIC_SUPABASE_URL is set,
 * otherwise the browser-only demo (src/lib/demo-auth/store.ts).
 * The store is a module-level singleton synced through localStorage, so no
 * context provider is needed; these hooks can be used in any client component.
 *
 * On the server and during hydration `ready` is false: render a neutral state
 * (no "signed out" flash) until it becomes true.
 */

export type { Enrollment, Student };

function useStore() {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}

export function useStudent() {
  const { ready, student } = useStore();
  return {
    ready,
    student,
    signUp: store.signUp,
    signIn: store.signIn,
    signOut: store.signOut,
  };
}

export function useEnrollments() {
  const { ready, student, enrollments } = useStore();

  const isEnrolled = useCallback((slug: string) => enrollments.some((e) => e.slug === slug), [enrollments]);
  const get = useCallback((slug: string) => enrollments.find((e) => e.slug === slug), [enrollments]);
  /** 0–100 for a course with `totalLessons` lessons. */
  const progress = useCallback(
    (slug: string, totalLessons: number) => {
      const e = enrollments.find((x) => x.slug === slug);
      if (!e || totalLessons <= 0) return 0;
      return Math.round((e.completedLessons.length / totalLessons) * 100);
    },
    [enrollments],
  );

  return {
    ready,
    signedIn: Boolean(student),
    enrollments,
    isEnrolled,
    get,
    progress,
    enroll: store.enroll,
    setLessonComplete: store.setLessonComplete,
  };
}
