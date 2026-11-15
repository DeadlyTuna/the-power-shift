/**
 * Student accounts run on Supabase (email + password auth, enrollments and
 * lesson progress in Postgres) when these are set; otherwise the site falls
 * back to the browser-only demo accounts in src/lib/demo-auth.
 *
 *   NEXT_PUBLIC_SUPABASE_URL        https://<project>.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY   the project's anon / publishable key
 *   SUPABASE_SERVICE_ROLE_KEY       server-only; used to grant course access after payment
 *
 * See docs/SETUP.md ("Student accounts") and supabase/migrations.
 */

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const authMode: "supabase" | "demo" = supabaseUrl && supabaseAnonKey ? "supabase" : "demo";
export const isRealAuth = authMode === "supabase";
