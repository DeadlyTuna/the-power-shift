"use client";

/**
 * Conversion events. Fires Meta Pixel and GA4 only when their IDs are
 * configured (NEXT_PUBLIC_META_PIXEL_ID / NEXT_PUBLIC_GA_ID) and the scripts
 * have loaded; otherwise it's a no-op, so feature code can call it freely.
 */

export type ConversionEvent =
  | "Lead"
  | "CompleteRegistration"
  | "InitiateCheckout"
  | "Purchase"
  | "AddToCart"
  | "AssessmentStarted"
  | "AssessmentCompleted"
  | "Contact"
  | "Schedule";

const META_STANDARD = new Set(["Lead", "CompleteRegistration", "InitiateCheckout", "Purchase", "AddToCart", "Contact", "Schedule"]);

type Fbq = (...args: unknown[]) => void;
type Gtag = (...args: unknown[]) => void;

export function track(event: ConversionEvent, params: Record<string, string | number | undefined> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { fbq?: Fbq; gtag?: Gtag };
  try {
    if (w.fbq) w.fbq(META_STANDARD.has(event) ? "track" : "trackCustom", event, params);
    if (w.gtag) w.gtag("event", event, params);
  } catch {
    // Analytics must never break the page.
  }
}
