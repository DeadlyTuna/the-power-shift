import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { isRealAuth, supabaseAnonKey, supabaseUrl } from "./env";

/** Request-scoped client that acts as the signed-in student (RLS applies). */
export async function supabaseServer(): Promise<SupabaseClient> {
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component: the proxy refreshes cookies instead.
        }
      },
    },
  });
}

/** The verified signed-in user for this request, or null (also null in demo mode). */
export async function currentUser(): Promise<User | null> {
  if (!isRealAuth) return null;
  const { data, error } = await (await supabaseServer()).auth.getUser();
  return error ? null : data.user;
}

let admin: SupabaseClient | null = null;

/**
 * Service-role client for trusted writes (granting course access after a
 * verified payment). Bypasses RLS: never expose it or its key to the browser.
 */
export function supabaseAdmin(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isRealAuth || !key) return null;
  if (!admin) admin = createClient(supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return admin;
}

/** Idempotently grants a student access to a course. Returns false if it couldn't be saved. */
export async function grantEnrollment(userId: string, courseSlug: string, reference: string): Promise<boolean> {
  const db = supabaseAdmin();
  if (!db) {
    console.error("[enroll] SUPABASE_SERVICE_ROLE_KEY is not set; cannot grant course access.");
    return false;
  }
  const { error } = await db
    .from("enrollments")
    .upsert({ user_id: userId, course_slug: courseSlug, reference }, { onConflict: "user_id,course_slug", ignoreDuplicates: true });
  if (error) console.error("[enroll] could not save enrollment", error.message);
  return !error;
}
