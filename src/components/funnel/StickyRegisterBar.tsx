"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { REGISTER_ID } from "./constants";
import { RegisterCta } from "./RegisterCta";

/**
 * The funnel pages' bottom bar on phones and small tablets: the page's
 * primary action plus WhatsApp (the floating WhatsApp button is hidden on
 * these pages, see WhatsAppFloat). Same look as the shared StickyCtaBar, but
 * it glides down out of the way and back up instead of snapping.
 *
 * The hero has no button of its own on phones, so the bar shows from the top
 * of the page. It steps aside while the registration card is on screen, and
 * from the closing section onwards, which has its own call to action and
 * leads into the footer. While it leaves it is inert, so it can't be tabbed
 * into, and once gone it is removed from the page.
 */
export function StickyRegisterBar({
  openLabel,
  closedLabel,
  whatsappMessage,
  source,
  endId,
}: {
  openLabel: string;
  closedLabel: string;
  whatsappMessage: string;
  /** Recorded with WhatsApp taps, e.g. "masterclass-sticky-bar". */
  source: string;
  /** Id of the closing section; the bar hides once it reaches the screen. */
  endId?: string;
}) {
  const [formInView, setFormInView] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observers: IntersectionObserver[] = [];

    const form = document.getElementById(REGISTER_ID);
    if (form) {
      // Ignore the strips under the sticky header and under this bar: a form
      // edge hidden there isn't really on screen.
      const io = new IntersectionObserver(([entry]) => setFormInView(entry.isIntersecting), {
        rootMargin: "-88px 0px -88px 0px",
      });
      io.observe(form);
      observers.push(io);
    }

    const end = endId ? document.getElementById(endId) : null;
    if (end) {
      // The root reaches far above the viewport, so "scrolled to or past the
      // closing section" is a single intersecting state. A jump straight to
      // the footer (End key, fast fling) still flips it.
      const io = new IntersectionObserver(([entry]) => setAtEnd(entry.isIntersecting), {
        rootMargin: "100000px 0px -88px 0px",
      });
      io.observe(end);
      observers.push(io);
    }

    return () => observers.forEach((io) => io.disconnect());
  }, [endId]);

  const hidden = formInView || atEnd;

  return (
    <AnimatePresence initial={false}>
      {hidden ? null : (
        <motion.aside
          key="sticky-register"
          aria-label="Quick registration"
          data-print="hide"
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ type: "spring", stiffness: 380, damping: 38 }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 shadow-[0_-12px_30px_-24px_rgba(42,22,54,0.45)] backdrop-blur-md lg:hidden"
        >
          <InertWhileLeaving>
            <div className="flex items-center gap-3 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex min-w-0 flex-1 [&>*]:w-full">
                <RegisterCta openLabel={openLabel} closedLabel={closedLabel} size="md" />
              </div>
              <WhatsAppLink
                iconOnly
                label="Ask a question on WhatsApp"
                message={whatsappMessage}
                source={source}
                variant="outline"
                className="bg-white"
              />
            </div>
          </InertWhileLeaving>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/** Makes the bar's contents unreachable by keyboard during its exit animation. */
function InertWhileLeaving({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return <div inert={!present}>{children}</div>;
}
