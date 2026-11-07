import { Users } from "lucide-react";
import type { Program } from "@/content/programs";
import { cn } from "@/lib/cn";
import { EventSwitch } from "./EventStatus";

/**
 * Honest urgency: the real seat cap, and the real registration count only
 * when it is set in content. Renders nothing for uncapped events.
 */
export function SeatNote({ program, className }: { program: Program; className?: string }) {
  const event = program.event;
  if (!event?.capacity) return null;
  const { capacity, seatsTaken } = event;
  const count =
    typeof seatsTaken === "number"
      ? seatsTaken >= capacity
        ? ` All ${capacity} seats are taken.`
        : ` ${seatsTaken} of ${capacity} seats are taken.`
      : null;

  return (
    <p className={cn("flex items-start gap-2", className)}>
      <Users aria-hidden="true" className="mt-[0.2em] size-[1.05em] shrink-0" />
      <span>
        Capped at {capacity} seats so everyone gets attention.
        {count ? <EventSwitch open={count} /> : null}
      </span>
    </p>
  );
}
