"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SIGN_IN_PATH, authHref } from "@/lib/demo-auth/next-path";
import { useStudent } from "./StudentProvider";

/**
 * Client-side gate for the demo student area. Once the browser-only account
 * state has loaded (`ready`), signed-out visitors are sent to sign in and
 * brought back to `returnTo` afterwards. Render a neutral state while
 * `!ready || !student`.
 */
export function useRequireStudent(returnTo: string) {
  const { ready, student, signOut } = useStudent();
  const router = useRouter();

  useEffect(() => {
    if (ready && !student) router.replace(authHref(SIGN_IN_PATH, returnTo));
  }, [ready, student, router, returnTo]);

  return { ready, student, signOut };
}
