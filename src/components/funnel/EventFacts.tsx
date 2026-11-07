import type { ReactNode } from "react";
import { CalendarDays, Clock, Hourglass, IndianRupee, Languages, Video } from "lucide-react";
import type { Program } from "@/content/programs";
import { formatDuration, formatEventDate, formatEventTime, formatINR } from "@/lib/format";
import { cn } from "@/lib/cn";
import { Beam } from "@/components/contact/FormMotion";
import { EventSwitch } from "./EventStatus";

function Fact({
  icon,
  label,
  className,
  children,
}: {
  icon: ReactNode;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-muted [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-marigold-700">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 leading-snug font-semibold text-jamun-900">{children}</dd>
    </div>
  );
}

/**
 * The event at a glance: date and time in IST, duration, platform, language
 * and price, on a white card with a slow light travelling round its border.
 * Once the event has started, the date reads "Next date announced soon" and
 * the old time disappears, so the page never promises a past date.
 *
 * `children` sit at the bottom of the card (the countdown).
 */
export function EventFacts({
  program,
  showDuration = false,
  showPrice = true,
  className,
  children,
}: {
  program: Program;
  /** Only for confirmed durations. */
  showDuration?: boolean;
  showPrice?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const event = program.event;
  if (!event) return null;

  return (
    <div
      className={cn(
        "relative rounded-card border border-line bg-white px-5 py-5 shadow-[0_18px_40px_-32px_rgba(42,22,54,0.45)] sm:px-7 sm:py-6",
        className,
      )}
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:flex sm:flex-wrap sm:gap-x-10">
        <EventSwitch
          open={
            <>
              <Fact icon={<CalendarDays aria-hidden="true" />} label="Date" className="col-span-2 sm:col-span-1">
                {formatEventDate(event.startsAt)}
              </Fact>
              <Fact icon={<Clock aria-hidden="true" />} label="Time">
                {formatEventTime(event.startsAt)}
              </Fact>
            </>
          }
          closed={
            <Fact icon={<CalendarDays aria-hidden="true" />} label="Date" className="col-span-2 sm:col-span-1">
              Next date announced soon
            </Fact>
          }
        />
        {showDuration ? (
          <Fact icon={<Hourglass aria-hidden="true" />} label="Duration">
            {formatDuration(event.durationMinutes)}, live
          </Fact>
        ) : null}
        <Fact icon={<Video aria-hidden="true" />} label="Where">
          Online, on {event.platform}
        </Fact>
        <Fact icon={<Languages aria-hidden="true" />} label="Language">
          {event.language}
        </Fact>
        {showPrice ? (
          <Fact icon={<IndianRupee aria-hidden="true" />} label="Price">
            {program.price ? formatINR(program.price.amount) : "Free"}
          </Fact>
        ) : null}
      </dl>
      {children}
      <Beam duration={16} size={160} />
    </div>
  );
}
