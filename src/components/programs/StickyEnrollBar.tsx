"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { StickyCtaBar } from "@/components/shared/StickyCtaBar";
import { buttonClasses } from "@/components/ui/Button";

/**
 * The program pages' bottom bar (shared shell: StickyCtaBar). It appears once
 * the hero's own call to action has scrolled away, so only one primary
 * action is ever in view, and hides again when the form is on screen or
 * above it, so it never covers the form or the footer.
 */
export function StickyEnrollBar({
  children,
  href = "#enroll",
  watchId,
  targetId = "enroll",
  whatsappMessage,
  source,
}: {
  /** Button label. */
  children: ReactNode;
  href?: string;
  /** Element whose visibility hides the bar (usually the hero CTA). */
  watchId: string;
  /** The section the bar links to; the bar hides once it is reached. */
  targetId?: string;
  whatsappMessage: string;
  /** Recorded with WhatsApp taps, e.g. "program-sticky-bar". */
  source: string;
}) {
  const [watchVisible, setWatchVisible] = useState(true);
  const [targetReached, setTargetReached] = useState(false);

  useEffect(() => {
    const watched = document.getElementById(watchId);
    const target = document.getElementById(targetId);
    if (!watched || !target || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === watched) setWatchVisible(entry.isIntersecting);
        if (entry.target === target) setTargetReached(entry.isIntersecting || entry.boundingClientRect.top < 0);
      }
    });
    io.observe(watched);
    io.observe(target);
    return () => io.disconnect();
  }, [watchId, targetId]);

  return (
    <StickyCtaBar
      hidden={watchVisible || targetReached}
      label="Quick enrollment"
      whatsapp={{ message: whatsappMessage, source }}
    >
      <a href={href} className={buttonClasses({ variant: "primary", size: "md" })}>
        <span>{children}</span>
        <ArrowRight aria-hidden="true" className="size-[1.1em] shrink-0" />
      </a>
    </StickyCtaBar>
  );
}
