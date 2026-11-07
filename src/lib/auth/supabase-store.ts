"use client";

/**
 * REAL student accounts on Supabase, with the same interface as the demo
 * store in src/lib/demo-auth/store.ts so the UI works with either.
 *
 * - Sign-up / sign-in / sign-out use Supabase Auth (email + password; the
 *   session lives in cookies, refreshed by src/proxy.ts).
 * - Enrollments are read-only here: the server grants course access after a
 *   verified payment (see grantEnrollment in src/lib/supabase/server.ts).
 *   `enroll()` just reloads them.
 * - Lesson progress is written directly; Row Level Security only allows rows
 *   for the signed-in student's own enrolled courses.
 */

import type { User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { MIN_PASSWORD_LENGTH, type AuthResult, type Enrollment, type Student } from "@/lib/demo-auth/store";

export { MIN_PASSWORD_LENGTH };
export type { AuthResult, Enrollment, Student };

type Snapshot = { ready: boolean; student: Student | null; enrollments: Enrollment[] };

const listeners = new Set<() => void>();
let snapshot: Snapshot = { ready: false, student: null, enrollments: [] };
const serverSnapshot: Snapshot = { ready: false, student: null, enrollments: [] };
let started = false;

function emit(next: Snapshot) {
  snapshot = next;
  listeners.forEach((l) => l());
}

function toStudent(user: User, profile: { name?: string; phone?: string } | null): Student {
  const meta = (user.user_metadata ?? {}) as { name?: string; phone?: string };
  return {
    id: user.id,
    name: profile?.name || meta.name || user.email?.split("@")[0] || "Student",
    email: user.email ?? "",
    phone: profile?.phone || meta.phone || "",
    createdAt: user.created_at,
  };
}

async function load(user: User | null) {
  if (!user) {
    emit({ ready: true, student: null, enrollments: [] });
    return;
  }
  const db = supabaseBrowser();
  const [profile, enrollments, progress] = await Promise.all([
    db.from("profiles").select("name, phone").eq("id", user.id).maybeSingle(),
    db.from("enrollments").select("course_slug, reference, enrolled_at").eq("user_id", user.id),
    db.from("lesson_progress").select("course_slug, lesson_id").eq("user_id", user.id),
  ]);
  const done = new Map<string, string[]>();
  for (const row of progress.data ?? []) {
    done.set(row.course_slug, [...(done.get(row.course_slug) ?? []), row.lesson_id]);
  }
  emit({
    ready: true,
    student: toStudent(user, profile.data),
    enrollments: (enrollments.data ?? []).map((e) => ({
      slug: e.course_slug,
      reference: e.reference,
      enrolledAt: e.enrolled_at,
      completedLessons: done.get(e.course_slug) ?? [],
    })),
  });
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  const auth = supabaseBrowser().auth;
  // Fires INITIAL_SESSION on start, then on every sign-in/out and token refresh (all tabs).
  auth.onAuthStateChange((event, session) => {
    if (event === "TOKEN_REFRESHED") return;
    // Defer: Supabase recommends not awaiting other Supabase calls inside this callback.
    setTimeout(() => void load(session?.user ?? null), 0);
  });
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  start();
  return () => listeners.delete(listener);
}

export function getSnapshot(): Snapshot {
  return snapshot;
}

export function getServerSnapshot(): Snapshot {
  return serverSnapshot;
}

function friendly(message: string): string {
  if (/rate limit|too many/i.test(message)) return "Too many attempts. Wait a minute and try again.";
  if (/network|fetch/i.test(message)) return "You appear to be offline. Check your connection and try again.";
  return message;
}

export async function signUp(input: { name: string; email: string; phone: string; password: string }): Promise<AuthResult> {
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, field: "password", error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  const email = input.email.trim().toLowerCase();
  const { data, error } = await supabaseBrowser().auth.signUp({
    email,
    password: input.password,
    options: {
      data: { name: input.name.trim(), phone: input.phone.trim() },
      emailRedirectTo: `${window.location.origin}/account`,
    },
  });
  if (error) {
    if (/registered|exists/i.test(error.message)) {
      return { ok: false, field: "email", error: "An account with this email already exists. Sign in instead." };
    }
    if (/password/i.test(error.message)) return { ok: false, field: "password", error: friendly(error.message) };
    return { ok: false, error: friendly(error.message) };
  }
  // With email confirmation on (Supabase's default) there's no session until the link is clicked.
  if (!data.session || !data.user) return { ok: true, student: null, confirmEmail: true, email };
  await load(data.user);
  return { ok: true, student: toStudent(data.user, { name: input.name, phone: input.phone }) };
}

export async function signIn(input: { email: string; password: string }): Promise<AuthResult> {
  const { data, error } = await supabaseBrowser().auth.signInWithPassword({
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
  if (error || !data.user) {
    if (error && /confirm/i.test(error.message)) {
      return { ok: false, field: "email", error: "Confirm your email first: open the link we sent when you signed up." };
    }
    if (error && !/invalid/i.test(error.message)) return { ok: false, error: friendly(error.message) };
    return { ok: false, field: "password", error: "That email and password don't match an account." };
  }
  await load(data.user);
  return { ok: true, student: snapshot.student ?? toStudent(data.user, null) };
}

export function signOut() {
  void supabaseBrowser()
    .auth.signOut()
    .then(() => emit({ ready: true, student: null, enrollments: [] }));
}

/**
 * Course access is granted by the server: after a verified Razorpay payment
 * (verify route / webhook) or, for mock courses in demo checkout, by
 * /api/courses/enroll. This asks the server to confirm, then reloads.
 */
export function enroll(slug: string, reference: string): boolean {
  void fetch("/api/courses/enroll", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, reference }),
  })
    .catch(() => null)
    .finally(() => {
      void supabaseBrowser()
        .auth.getUser()
        .then(({ data }) => load(data.user));
    });
  return true;
}

export function setLessonComplete(slug: string, lessonId: string, complete: boolean): boolean {
  const { student } = snapshot;
  if (!student) return false;
  // Optimistic update, then persist; reload on failure so the UI matches the database.
  emit({
    ...snapshot,
    enrollments: snapshot.enrollments.map((e) => {
      if (e.slug !== slug) return e;
      const done = new Set(e.completedLessons);
      if (complete) done.add(lessonId);
      else done.delete(lessonId);
      return { ...e, completedLessons: [...done] };
    }),
  });
  const table = supabaseBrowser().from("lesson_progress");
  const write = complete
    ? table.upsert({ user_id: student.id, course_slug: slug, lesson_id: lessonId }, { onConflict: "user_id,course_slug,lesson_id" })
    : table.delete().eq("user_id", student.id).eq("course_slug", slug).eq("lesson_id", lessonId);
  void write.then(({ error }) => {
    if (error) {
      console.error("[progress] could not save", error.message);
      void supabaseBrowser().auth.getUser().then(({ data }) => load(data.user));
    }
  });
  return true;
}

/** Sends a password-reset email. Always reports success so accounts can't be probed. */
export async function requestPasswordReset(email: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/account/update-password`,
  });
  if (error && /rate limit|network|fetch/i.test(error.message)) return { ok: false, error: friendly(error.message) };
  return { ok: true };
}

/** Sets a new password for the student signed in via a reset link. */
export async function updatePassword(password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (password.length < MIN_PASSWORD_LENGTH) return { ok: false, error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` };
  const { error } = await supabaseBrowser().auth.updateUser({ password });
  return error ? { ok: false, error: friendly(error.message) } : { ok: true };
}
