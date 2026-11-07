"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { whatsappLink } from "@/content/site";
import { WhatsAppIcon } from "@/components/ui/icons";

/**
 * Floating WhatsApp button. Hidden where it would compete with a primary task
 * or overlap a page's own sticky CTA bar. Pages with a sticky bottom bar
 * (StickyCtaBar) must be matched here, because the bar offers WhatsApp itself.
 *
 * It springs in shortly after the page settles, lifts a little under a mouse
 * pointer and dips when pressed. Without JavaScript it is simply shown
 * (data-reveal); with reduced motion it only fades in.
 */
export const HIDE_WHATSAPP_ON = ["/checkout", "/cart", "/enroll", "/assessment", "/masterclass", "/leadership-workshop"];

/** Sections whose detail pages (but not the index) have a sticky bar: /programs/<slug>. */
const HIDE_ON_DETAIL_PAGES_OF = ["/programs"];

function hiddenOn(pathname: string) {
  return (
    HIDE_WHATSAPP_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    HIDE_ON_DETAIL_PAGES_OF.some((p) => pathname.startsWith(`${p}/`))
  );
}

export function WhatsAppFloat() {
  const pathname = usePathname() ?? "/";
  if (hiddenOn(pathname)) return null;

  return (
    // Entrance on the wrapper, hover and press on the link, so the entrance delay never slows the hover.
    <motion.div
      data-print="hide"
      data-reveal=""
      initial={{ opacity: 0, scale: 0.6, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 1.2 }}
      className="fixed right-4 bottom-4 z-30 sm:right-6 sm:bottom-6"
    >
      <motion.a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp (opens in a new tab)"
        whileHover={{ y: -3, scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        className="inline-flex size-14 items-center justify-center rounded-full bg-peacock-600 text-white shadow-[0_10px_30px_-8px_rgba(14,107,107,0.6)] transition-colors duration-200 hover:bg-peacock-700"
      >
        <WhatsAppIcon className="size-7" />
      </motion.a>
    </motion.div>
  );
}
