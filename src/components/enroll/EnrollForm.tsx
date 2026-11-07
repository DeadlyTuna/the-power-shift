"use client";

import { useId } from "react";
import type { Program } from "@/content/programs";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { ApplicationForm } from "./ApplicationForm";
import { RegistrationForm } from "./RegistrationForm";

/**
 * One enrollment form for every program mode in src/content/programs.ts:
 *
 *   free         live event, free registration (waitlist once the start time has passed)
 *   paid         live event, registration + payment (waitlist once the start time has passed)
 *   application  ongoing program, application → clarity call
 *   enquiry      corporate training, links to /corporate
 *
 * On a dark band (tone="dark") the form sits on its own white panel so labels,
 * hints and errors keep their contrast.
 */
export type EnrollFormProps = {
  program: Program;
  /** Where the form is embedded, recorded with the submission (e.g. "masterclass-hero"). */
  source?: string;
  /** Visual treatment for the surface it sits on. */
  tone?: "light" | "dark";
  /** Prefix for field ids when the form appears more than once on a page. */
  idPrefix?: string;
  className?: string;
};

export function EnrollForm({ program, source, tone = "light", idPrefix, className }: EnrollFormProps) {
  const autoId = useId();
  const prefix = idPrefix ?? `enroll-${autoId.replace(/[^A-Za-z0-9_-]/g, "")}`;

  if (program.mode === "enquiry") {
    return (
      <div className={className}>
        <ButtonLink href="/corporate" size="lg" arrow>
          Enquire about corporate training
        </ButtonLink>
      </div>
    );
  }

  return (
    <div
      className={cn(
        tone === "dark" &&
          "rounded-card bg-white p-5 text-ink sm:p-7 [&_:focus-visible]:outline-jamun-900 [&_:focus-visible]:shadow-[0_0_0_5px_var(--color-marigold-400)]",
        className,
      )}
    >
      {program.mode === "application" ? (
        <ApplicationForm program={program} source={source} idPrefix={prefix} />
      ) : (
        <RegistrationForm program={program} source={source} idPrefix={prefix} />
      )}
    </div>
  );
}
