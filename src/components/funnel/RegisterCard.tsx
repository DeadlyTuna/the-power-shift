import type { ReactNode } from "react";
import type { Program } from "@/content/programs";
import { EnrollForm } from "@/components/enroll/EnrollForm";
import { Card } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";
import { EventSwitch } from "./EventStatus";
import { REGISTER_ID } from "./constants";

/**
 * The registration card every call to action on a funnel page points at
 * (id="register"). It takes focus after a jump so keyboard and screen-reader
 * users land on the form. The heading, intro and footnote follow the event
 * state; the form itself switches to the waitlist on its own and explains
 * why, so the closed state needs little extra copy here.
 */
export function RegisterCard({
  program,
  source,
  idPrefix,
  openTitle,
  closedTitle,
  openIntro,
  closedIntro,
  openFootnote,
  closedFootnote,
  className,
}: {
  program: Program;
  source: string;
  idPrefix: string;
  openTitle: string;
  closedTitle: string;
  openIntro?: ReactNode;
  closedIntro?: ReactNode;
  openFootnote?: ReactNode;
  closedFootnote?: ReactNode;
  className?: string;
}) {
  const titleId = `${REGISTER_ID}-title`;

  const header = (title: string, intro?: ReactNode) => (
    <>
      <h2 id={titleId} className="display-sm text-jamun-900">
        {title}
      </h2>
      {intro ? <div className="mt-2 text-[0.9875rem] text-muted">{intro}</div> : null}
    </>
  );

  const footnote = (content?: ReactNode) =>
    content ? <div className="mt-6 border-t border-line pt-5 text-[0.9375rem] text-muted">{content}</div> : null;

  return (
    <Card
      id={REGISTER_ID}
      role="region"
      tabIndex={-1}
      aria-labelledby={titleId}
      className={cn("p-6 sm:p-8", className)}
    >
      <EventSwitch open={header(openTitle, openIntro)} closed={header(closedTitle, closedIntro)} />
      <EnrollForm program={program} source={source} idPrefix={idPrefix} tone="light" className="mt-6" />
      <EventSwitch open={footnote(openFootnote)} closed={footnote(closedFootnote)} />
    </Card>
  );
}
