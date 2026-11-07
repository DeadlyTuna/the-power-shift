import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isRealAuth, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Keeps Supabase student sessions fresh: refreshes the auth token on page
 * requests and writes the updated cookies. Does nothing in demo mode.
 */
export async function proxy(request: NextRequest) {
  if (!isRealAuth) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet, headers) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });
  // Validates and, if needed, refreshes the session.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  // Pages and API routes only; skip static assets and images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|.*\.(?:png|jpg|jpeg|svg|webp|ico|woff2?)$).*)"],
};
