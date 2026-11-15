"use client";

import type { ReactNode } from "react";
import { whatsappLink } from "@/content/site";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

/**
 * WhatsApp chat link with a prefilled message. Opens in a new tab and records
 * a "Contact" conversion with where on the page it was tapped.
 */
export function WhatsAppLink({
  message,
  source,
  variant = "outline",
  size = "md",
  iconOnly,
  label,
  className,
  children,
}: {
  message: string;
  /** Recorded with the Contact event, e.g. "masterclass-sticky-bar". */
  source: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Render a round icon button; `label` becomes its accessible name. */
  iconOnly?: boolean;
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={iconOnly ? `${label ?? "Chat on WhatsApp"} (opens in a new tab)` : undefined}
      onClick={() => track("Contact", { method: "whatsapp", source })}
      className={cn(buttonClasses({ variant, size }), iconOnly && "size-12 shrink-0 p-0", className)}
    >
      <WhatsAppIcon className={cn("shrink-0", iconOnly ? "size-6" : "size-[1.15em]")} />
      {iconOnly ? null : (
        <span>
          {children ?? label}
          <span className="sr-only"> (opens in a new tab)</span>
        </span>
      )}
    </a>
  );
}
