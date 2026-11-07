"use client";

import { postJSON, type ApiResult } from "@/lib/http";
import type { CheckoutSession } from "./razorpay";

/**
 * Browser side of Razorpay Checkout.
 *
 * Flow:
 *   1. Your feature's API route creates an order and returns a CheckoutStart.
 *   2. Call `startCheckout(start)`:
 *        - "razorpay": opens Checkout, then verifies via /api/payments/verify
 *        - "link":     sends the visitor to the hosted payment page
 *        - "free":     nothing to pay
 *        - "demo":     MOCK programs while Razorpay isn't configured: nothing is
 *                      charged; pass `confirmDemo` to show a demo checkout dialog
 *                      (see src/components/enroll/DemoCheckout.tsx). Confirming
 *                      it counts as paid, cancelling as dismissed.
 *   3. On success, navigate to `result.redirectTo`.
 */

export type { CheckoutSession };

export type DemoCheckoutStart = { mode: "demo"; reference: string; redirectTo: string };

export type CheckoutStart =
  | { mode: "razorpay"; session: CheckoutSession }
  | { mode: "link"; url: string }
  | { mode: "free"; redirectTo: string }
  | DemoCheckoutStart;

export type CheckoutOptions = {
  /** Shows the demo checkout and resolves true when the visitor completes it. */
  confirmDemo?: (start: DemoCheckoutStart) => Promise<boolean>;
};

export type CheckoutOutcome =
  | { status: "paid"; redirectTo: string; reference: string }
  | { status: "redirected" }
  | { status: "dismissed" }
  | { status: "failed"; error: string };

type RazorpaySuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void; on: (event: string, cb: (resp: unknown) => void) => void };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise: Promise<boolean> | null = null;

export function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export async function startCheckout(start: CheckoutStart, options: CheckoutOptions = {}): Promise<CheckoutOutcome> {
  if (start.mode === "free") return { status: "paid", redirectTo: start.redirectTo, reference: "" };

  if (start.mode === "demo") {
    if (!options.confirmDemo) {
      return { status: "failed", error: "The demo checkout couldn't open. Refresh the page and try again." };
    }
    const completed = await options.confirmDemo(start);
    return completed
      ? { status: "paid", redirectTo: start.redirectTo, reference: start.reference }
      : { status: "dismissed" };
  }

  if (start.mode === "link") {
    window.location.assign(start.url);
    return { status: "redirected" };
  }

  const loaded = await loadRazorpay();
  if (!loaded || !window.Razorpay) {
    return {
      status: "failed",
      error: "The payment window couldn't load. Check your connection or disable ad-blockers for this site, then try again.",
    };
  }

  const { session } = start;
  const Razorpay = window.Razorpay;

  const response = await new Promise<RazorpaySuccess | "dismissed" | { error: string }>((resolve) => {
    const rzp = new Razorpay({
      key: session.keyId,
      order_id: session.orderId,
      amount: session.amount,
      currency: session.currency,
      name: session.name,
      description: session.description,
      prefill: session.prefill,
      theme: { color: "#2A1636" },
      handler: (resp: RazorpaySuccess) => resolve(resp),
      modal: { ondismiss: () => resolve("dismissed"), confirm_close: true },
    });
    rzp.on("payment.failed", (resp: unknown) => {
      const description =
        (resp as { error?: { description?: string } })?.error?.description ?? "The payment didn't go through.";
      // Razorpay keeps the modal open so the visitor can retry; we only record the message.
      console.warn("[checkout] payment failed:", description);
    });
    rzp.open();
  });

  if (response === "dismissed") return { status: "dismissed" };
  if ("error" in response) return { status: "failed", error: response.error };

  const verified: ApiResult<{ redirectTo: string; reference: string }> = await postJSON("/api/payments/verify", response);
  if (!verified.ok) {
    return {
      status: "failed",
      error: `${verified.error} Your payment reference is ${response.razorpay_payment_id}.`,
    };
  }
  return { status: "paid", redirectTo: verified.redirectTo, reference: verified.reference };
}
