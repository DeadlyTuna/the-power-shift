"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { Marquee } from "@/components/kit/marquee";
import { cn } from "@/lib/cn";

/**
 * "Who should attend" as a slow, drifting row of role chips.
 *
 * The list itself is a real <ul> for screen readers (rendered once); the
 * moving copy is decorative and hidden from them, because the marquee repeats
 * its children. It pauses on hover and with its own Pause button (moving
 * content needs a way to stop it). With reduced motion the moving row is
 * replaced by the same chips, wrapped and still.
 */

const chip = "shrink-0 rounded-full border border-line bg-paper px-4 py-2.5 text-[0.9875rem] font-medium text-jamun-900";

export function RoleMarquee({ roles, className }: { roles: string[]; className?: string }) {
  const [paused, setPaused] = useState(false);

  return (
    <div className={className}>
      <ul className="sr-only motion-reduce:not-sr-only motion-reduce:flex motion-reduce:flex-wrap motion-reduce:gap-2.5">
        {roles.map((role) => (
          <li key={role} className={chip}>
            {role}
          </li>
        ))}
      </ul>

      <div className="motion-reduce:hidden">
        <div
          aria-hidden="true"
          className="-mx-5 [mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)] sm:-mx-8"
        >
          <Marquee
            pauseOnHover
            repeat={3}
            className={cn("p-0 py-1 [--duration:55s] [--gap:0.625rem]", paused && "[&>div]:[animation-play-state:paused]!")}
          >
            {roles.map((role) => (
              <span key={role} className={chip}>
                {role}
              </span>
            ))}
          </Marquee>
        </div>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full pr-2 text-sm font-medium text-muted transition-colors hover:text-jamun-900 [html:not(.js)_&]:hidden"
        >
          {paused ? <Play aria-hidden="true" className="size-4" /> : <Pause aria-hidden="true" className="size-4" />}
          {paused ? "Play the moving list" : "Pause the moving list"}
        </button>
      </div>
    </div>
  );
}
