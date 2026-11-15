"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, Compass, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/kit/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/kit/dropdown-menu";
import { SIGN_IN_PATH, SIGN_UP_PATH, authHref } from "@/lib/demo-auth/next-path";
import { cn } from "@/lib/cn";
import { useStudent } from "./StudentProvider";
import { firstName, initials } from "./student-utils";

/** Where to come back to after signing in from the header: the current page, unless it's home or the account area. */
function returnPath(pathname: string): string | null {
  return pathname === "/" || pathname.startsWith("/account") ? null : pathname;
}

function signOutWithToast(signOut: () => void) {
  signOut();
  toast("You're signed out", { description: "Your demo account and progress stay in this browser." });
}

const itemClass = "min-h-11 cursor-pointer gap-3 rounded-xl px-3 text-[0.9375rem] text-ink focus:bg-mist focus:text-jamun-900";

/**
 * Student entry point in the site header: a "Sign in" link when signed out,
 * an initials avatar with a menu when signed in. Renders a same-size blank
 * until the browser-only account state is ready, so there's no flash.
 */
export function HeaderAccount({ className }: { className?: string }) {
  const { ready, student, signOut } = useStudent();
  const pathname = usePathname() ?? "/";

  if (!ready) return <span aria-hidden="true" className={cn("inline-block size-11 shrink-0", className)} />;

  if (!student) {
    return (
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className={className}>
        <Link
          href={authHref(SIGN_IN_PATH, returnPath(pathname))}
          aria-current={pathname === SIGN_IN_PATH ? "page" : undefined}
          className="inline-flex min-h-11 items-center rounded-full px-2.5 text-[0.9875rem] font-semibold whitespace-nowrap text-jamun-900 transition-colors hover:bg-mist sm:px-3.5"
        >
          Sign in
        </Link>
      </motion.span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.92 }}
          aria-label={`Account menu for ${student.name}`}
          className={cn(
            "inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-mist data-[state=open]:bg-mist",
            className,
          )}
        >
          <Avatar className="size-9 ring-2 ring-marigold-300 ring-offset-1 ring-offset-paper">
            <AvatarFallback className="bg-jamun-900 text-[0.8125rem] font-semibold tracking-wide text-white">
              {initials(student.name)}
            </AvatarFallback>
          </Avatar>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-64 rounded-2xl border-line p-1.5 shadow-[0_24px_48px_-24px_rgba(42,22,54,0.45)]"
      >
        <DropdownMenuLabel className="px-3 py-2.5">
          <span className="block truncate text-[0.9375rem] font-semibold text-jamun-900">{student.name}</span>
          <span className="block truncate text-sm font-normal text-muted">{student.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-line" />
        <DropdownMenuItem asChild className={itemClass}>
          <Link href="/account">
            <BookOpen aria-hidden="true" className="text-jamun-700" />
            My courses
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className={itemClass}>
          <Link href="/courses">
            <Compass aria-hidden="true" className="text-jamun-700" />
            Browse courses
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-line" />
        <DropdownMenuItem className={itemClass} onSelect={() => signOutWithToast(signOut)}>
          <LogOut aria-hidden="true" className="text-jamun-700" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Compact student row for the mobile menu. */
export function MobileAccountRow() {
  const { ready, student, signOut } = useStudent();
  const pathname = usePathname() ?? "/";
  if (!ready) return null;

  const linkClass =
    "font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900";

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
      {student ? (
        <>
          <Avatar className="size-10">
            <AvatarFallback className="bg-jamun-900 text-sm font-semibold text-white">{initials(student.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-jamun-900">Hi, {firstName(student.name)}</p>
            <p className="flex flex-wrap gap-x-4 text-[0.9375rem]">
              <Link href="/account" className={cn(linkClass, "inline-flex min-h-11 items-center")}>
                My courses
              </Link>
              <button
                type="button"
                onClick={() => signOutWithToast(signOut)}
                className="inline-flex min-h-11 items-center text-muted underline decoration-line decoration-2 underline-offset-4 hover:text-jamun-900"
              >
                Sign out
              </button>
            </p>
          </div>
        </>
      ) : (
        <p className="flex flex-wrap items-center gap-x-4 text-[0.9375rem] text-muted">
          <span>Student area:</span>
          <Link href={authHref(SIGN_IN_PATH, returnPath(pathname))} className={cn(linkClass, "inline-flex min-h-11 items-center")}>
            Sign in
          </Link>
          <Link href={authHref(SIGN_UP_PATH, returnPath(pathname))} className={cn(linkClass, "inline-flex min-h-11 items-center")}>
            Create account
          </Link>
        </p>
      )}
    </div>
  );
}
