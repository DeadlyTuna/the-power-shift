import { CalendarPlus, Download, PlayCircle } from "lucide-react";
import { assessmentCopy, statements } from "@/content/assessment";
import type { Program } from "@/content/programs";
import { communityLink, site, whatsappLink } from "@/content/site";
import { PaletteConfetti } from "@/components/courses/PaletteConfetti";
import { googleCalendarUrl } from "@/components/enroll/calendar";
import { ButtonLink, buttonClasses } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Section } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";
import { formatDuration, formatEventDate, formatEventTime } from "@/lib/format";
import { NextSteps, type NextStep } from "./NextSteps";

/**
 * The confirmation shown after registering or paying.
 *
 * program    a free or paid live event the visitor registered for (optional;
 *            legacy /thankyou links arrive with no parameters)
 * reference  our payment reference, shown when a payment was verified
 * upcoming   whether the event is still ahead (decided per request by the page)
 */
export type ThankYouContentProps = {
  program?: Program;
  reference?: string;
  upcoming: boolean;
};

const PREPARE = [
  "A quiet space where you can listen and speak freely",
  "A notebook and pen",
  "The one question you most want answered",
  "Join 5 minutes early, so you don't miss the start",
];

const inlineLink =
  "font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-2 hover:decoration-jamun-900";

function confirmation(program: Program | undefined, reference: string | undefined, upcoming: boolean) {
  const event = program?.event;
  // Only name the date while it is still ahead; an old link opened later shouldn't confirm a past session.
  const when = event && upcoming ? ` on ${formatEventDate(event.startsAt)} at ${formatEventTime(event.startsAt)}` : "";

  if (!program) {
    return reference
      ? { eyebrow: "Payment received", summary: "Your payment went through. Thank you." }
      : { eyebrow: "Thank you", summary: "Thank you for registering. Your details have reached Manisha's team." };
  }
  if (program.course) {
    return {
      eyebrow: reference ? "Payment received" : "Enrollment confirmed",
      summary: `You're enrolled in ${program.title}. Start your first lesson whenever you're ready.`,
    };
  }
  if (program.mode === "free") {
    return { eyebrow: "Registration confirmed", summary: `Your free seat for the ${program.shortTitle}${when} is reserved.` };
  }
  if (reference) {
    return {
      eyebrow: "Payment received",
      summary: `Your payment went through and your seat for the ${program.shortTitle}${when} is confirmed.`,
    };
  }
  return { eyebrow: "Thank you", summary: `Thank you for registering for the ${program.shortTitle}${when}.` };
}

export function ThankYouContent({ program, reference, upcoming }: ThankYouContentProps) {
  const event = program?.event;
  const { eyebrow, summary } = confirmation(program, reference, upcoming);
  const community = communityLink(
    program
      ? `Hi, I've registered for the ${program.shortTitle}. Please add me to the community.`
      : "Hi, I've registered. Please add me to the WhatsApp community.",
  );

  const steps: NextStep[] = [];

  if (program?.course) {
    steps.push({
      id: "start",
      title: "Start your first lesson",
      body: (
        <p>
          Your course is waiting in My courses. Access is tied to your demo account in this browser, so sign in here to
          pick up where you left off.
        </p>
      ),
      actions: (
        <ButtonLink href={`/account/courses/${program.slug}`} size="lg" icon={<PlayCircle />} arrow className="w-full sm:w-auto">
          Start learning
        </ButtonLink>
      ),
    });
  }

  steps.push(
    {
      id: "community",
      title: "Join the WhatsApp community",
      body: (
        <p>
          {program?.course
            ? "Live session announcements, new courses and support all come through the community."
            : "This is where the joining link and all session updates are shared, so please don't skip this step."}
        </p>
      ),
      actions: (
        <ButtonLink href={community.href} size="lg" icon={<WhatsAppIcon />} className="w-full sm:w-auto">
          {community.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </ButtonLink>
      ),
    },
  );

  if (program && event && upcoming) {
    const google = googleCalendarUrl(program);
    steps.push(
      {
        id: "calendar",
        title: "Add it to your calendar",
        body: (
          <>
            <p>
              {formatEventDate(event.startsAt)}, {formatEventTime(event.startsAt)}.{" "}
              {formatDuration(event.durationMinutes)}, live on {event.platform}.
            </p>
            <p className="text-[0.9375rem] text-muted">The calendar file works with Apple Calendar, Outlook and most other calendar apps.</p>
          </>
        ),
        actions: (
          <>
            <a
              href={`/api/calendar/${program.slug}`}
              download={`${program.slug}.ics`}
              className={buttonClasses({ variant: "outline" })}
            >
              <Download aria-hidden="true" className="size-[1.15em] shrink-0" />
              <span>Download calendar file</span>
            </a>
            {google ? (
              <a
                href={google}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "outline" })}
              >
                <CalendarPlus aria-hidden="true" className="size-[1.15em] shrink-0" />
                <span>
                  Add to Google Calendar<span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            ) : null}
          </>
        ),
      },
      {
        id: "prepare",
        title: "Prepare for the session",
        body: (
          <ul className="flex flex-col gap-2">
            {PREPARE.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-marigold-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ),
      },
    );
  }

  steps.push({
    id: "assessment",
    title: "While you wait, take the free Power Self-Assessment",
    body: (
      <p>
        {statements.length} short statements, about {assessmentCopy.minutes} minutes, no right answers. See which
        pattern is draining your power most
        {program?.course ? ", and see which lessons will help you most" : program && upcoming ? ", and bring that insight with you to the session" : ""}.
      </p>
    ),
    actions: (
      <ButtonLink href="/assessment" variant="dark" arrow className="text-balance">
        Take the free Power Self-Assessment
      </ButtonLink>
    ),
  });

  return (
    <>
      {program ? <PaletteConfetti /> : null}
      <Section tone="jamun" className="py-14 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <p className="eyebrow text-marigold-300">{eyebrow}</p>
            <h1 className="display-xl mt-4 text-white">{program?.course ? "You’re enrolled." : "You’re in."}</h1>
            <p className="lede mt-5 max-w-xl text-jamun-100">{summary}</p>
            {reference ? (
              <div className="mt-8 inline-flex flex-col rounded-xl border border-white/15 bg-white/[0.06] px-5 py-4">
                <p className="text-sm text-jamun-200">Payment reference</p>
                <p className="mt-0.5 text-xl font-semibold tracking-wide break-all text-white select-all">{reference}</p>
                <p className="mt-1 text-sm text-jamun-200">Keep it handy in case you need help with your payment.</p>
              </div>
            ) : null}
          </div>
          <Reframe
            tone="dark"
            size="lg"
            script="I'll invest in myself when life slows down."
            shift="I started today."
            className="lg:pb-2"
          />
        </div>
      </Section>

      <Section tone="paper" className="py-14 md:py-20">
        <div className="max-w-3xl">
          <h2 className="display-md text-jamun-900">What happens next</h2>
          <NextSteps steps={steps} className="mt-8" />
          <p className="mt-10 text-muted">
            Questions about your registration?{" "}
            <a
              href={whatsappLink(
                program ? `Hi, I have a question about my registration for the ${program.shortTitle}.` : undefined,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={inlineLink}
            >
              Message us on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
            </a>{" "}
            at {site.contact.phoneDisplay}, {site.contact.hours}.
          </p>
        </div>
      </Section>
    </>
  );
}
