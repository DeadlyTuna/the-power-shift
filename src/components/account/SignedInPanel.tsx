"use client";

import { CircleCheck, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/kit/avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ACCOUNT_HOME } from "@/lib/demo-auth/next-path";
import type { Student } from "./StudentProvider";
import { useStudent } from "./StudentProvider";
import { AuthHeading, DemoNote } from "./AuthCard";
import { initials } from "./student-utils";

/** Shown on the sign-in / create-account pages when someone is already signed in. */
export function SignedInPanel({ student, next }: { student: Student; next: string }) {
  const { signOut } = useStudent();
  const goingElsewhere = next !== ACCOUNT_HOME;

  return (
    <div className="flex flex-col gap-6">
      <AuthHeading title="You're already signed in" />
      <div className="flex items-center gap-4 rounded-xl border border-line bg-paper p-4">
        <Avatar className="size-12">
          <AvatarFallback className="bg-jamun-900 font-semibold text-white">{initials(student.name)}</AvatarFallback>
        </Avatar>
        <p className="min-w-0 leading-snug">
          You&rsquo;re signed in as <strong className="font-semibold text-jamun-900">{student.name}</strong>
          <span className="block truncate text-[0.9375rem] text-muted">{student.email}</span>
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <ButtonLink href={next} size="lg" arrow>
          {goingElsewhere ? "Continue" : "Go to my courses"}
        </ButtonLink>
        <ButtonLink href="/courses" variant="outline" size="lg">
          Browse courses
        </ButtonLink>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 text-[0.9375rem] text-muted">
        <span>Not you?</span>
        <Button
          variant="link"
          className="min-h-11 text-[0.9375rem]"
          onClick={() => {
            signOut();
            toast("You're signed out", { description: "You can sign in with another demo account now." });
          }}
        >
          Sign out
        </Button>
      </div>
      <DemoNote />
    </div>
  );
}

/** Brief confirmation while we navigate after signing in or creating an account. */
export function RedirectingPanel({ title, destination }: { title: string; destination: string }) {
  return (
    <div className="flex flex-col items-start gap-5 py-6" role="status">
      <CircleCheck aria-hidden="true" className="size-12 text-peacock-600" />
      <div>
        <h1 className="display-md">{title}</h1>
        <p className="mt-3 flex items-center gap-2 text-muted">
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:hidden" />
          Taking you to {destination}…
        </p>
      </div>
    </div>
  );
}

export function destinationLabel(next: string): string {
  if (next === ACCOUNT_HOME) return "your courses";
  if (next.startsWith("/account/courses/")) return "your lesson";
  if (next.startsWith("/courses")) return "the course";
  if (next.startsWith("/checkout") || next.startsWith("/enroll")) return "checkout";
  return "where you left off";
}
