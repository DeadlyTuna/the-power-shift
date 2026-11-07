"use client";

import type { MouseEvent } from "react";
import { ButtonLink, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { REGISTER_ID } from "./constants";
import { useEventOpen } from "./EventStatus";

/**
 * Smooth-scrolls to the registration card and moves focus to it, so keyboard
 * and screen-reader users land on the form too. Without JS the plain
 * "#register" anchor still jumps there.
 */
export function jumpToRegister(event: MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById(REGISTER_ID);
  if (!target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  target.focus({ preventScroll: true });
}

/**
 * The page's primary call to action. Every instance jumps to the registration
 * card; the label follows the event state so it always says what happens next.
 */
export function RegisterCta({
  openLabel,
  closedLabel,
  variant = "primary",
  size = "lg",
  className,
}: {
  openLabel: string;
  closedLabel: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const open = useEventOpen();
  return (
    <ButtonLink
      href={`#${REGISTER_ID}`}
      onClick={jumpToRegister}
      variant={variant}
      size={size}
      arrow
      className={className}
    >
      {open ? openLabel : closedLabel}
    </ButtonLink>
  );
}
