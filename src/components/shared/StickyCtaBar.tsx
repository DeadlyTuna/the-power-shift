"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { WhatsAppLink } from "./WhatsAppLink";

/**
 * The bottom call-to-action bar for long pages on phones and small tablets
 * (funnel landing pages and program detail pages): the page's primary action
 * plus a WhatsApp button. Pages that show it hide the floating WhatsApp
 * button (see WhatsAppFloat), so WhatsApp lives here instead and the two
 * never overlap.
 *
 * Each page decides when the bar steps aside (e.g. while its form is on
 * screen); a hidden bar is inert, so it can't be tabbed into.
 */
export function StickyCtaBar({
  hidden,
  label,
  whatsapp,
  children,
}: {
  hidden: boolean;
  /** Accessible name of the landmark, e.g. "Quick registration". */
  label: string;
  whatsapp: { message: string; source: string };
  /** The primary action; it stretches to fill the bar. */
  children: ReactNode;
}) {
  return (
    <aside
      aria-label={label}
      data-print="hide"
      inert={hidden}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur-md transition-[translate,visibility] duration-300 ease-shift lg:hidden",
        hidden ? "invisible translate-y-full" : "visible translate-y-0",
      )}
    >
      <div className="flex items-center gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex min-w-0 flex-1 [&>*]:w-full">{children}</div>
        <WhatsAppLink
          iconOnly
          label="Ask a question on WhatsApp"
          message={whatsapp.message}
          source={whatsapp.source}
          variant="outline"
          className="bg-white"
        />
      </div>
    </aside>
  );
}
