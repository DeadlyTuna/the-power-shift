"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAnonKey, supabaseUrl } from "./env";

let client: SupabaseClient | null = null;

/** Singleton browser client. Only call when authMode is "supabase". */
export function supabaseBrowser(): SupabaseClient {
  if (!client) client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
