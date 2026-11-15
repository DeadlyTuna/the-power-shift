"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/kit/dialog";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";
import type { DemoCheckoutStart } from "@/lib/payments/checkout-client";

/**
 * The demo checkout shown for MOCK programs while Razorpay isn't configured
 * (the API answers { mode: "demo" }). It stands in for the payment window:
 * "Complete demo payment" counts as paid, closing it counts as dismissed, so
 * every paid flow behaves exactly as it will with real payments.
 *
 *   const demo = useDemoCheckout();
 *   await startCheckout(start, {
 *     confirmDemo: (s) => demo.confirm({ item: program.title, amount, reference: s.reference }),
 *   });
 *   …
 *   return <>{form}{demo.dialog}</>;
 */

export type DemoCheckoutDetails = {
  /** What is being bought, e.g. the program title. */
  item: string;
  /** Listed price in rupees, from src/content. */
  amount?: number;
  reference: DemoCheckoutStart["reference"];
};

export function useDemoCheckout(): { confirm: (details: DemoCheckoutDetails) => Promise<boolean>; dialog: ReactNode } {
  const [open, setOpen] = useState(false);
  // Kept after closing so the content doesn't vanish mid-exit animation.
  const [details, setDetails] = useState<DemoCheckoutDetails | null>(null);
  const resolver = useRef<((completed: boolean) => void) | null>(null);

  const confirm = useCallback((next: DemoCheckoutDetails) => {
    resolver.current?.(false);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
      setDetails(next);
      setOpen(true);
    });
  }, []);

  const settle = useCallback((completed: boolean) => {
    resolver.current?.(completed);
    resolver.current = null;
    setOpen(false);
  }, []);

  const dialog = (
    <DemoCheckoutDialog
      open={open}
      details={details}
      onComplete={() => settle(true)}
      onCancel={() => settle(false)}
    />
  );

  return { confirm, dialog };
}

function DemoCheckoutDialog({
  open,
  details,
  onComplete,
  onCancel,
}: {
  open: boolean;
  details: DemoCheckoutDetails | null;
  onComplete: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="gap-0 rounded-(--radius-card) border-line bg-white p-6 text-ink sm:max-w-md sm:p-8">
        <DialogHeader className="text-left">
          <motion.span
            aria-hidden="true"
            initial={{ scale: 0.6, opacity: 0, rotate: -12 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.05 }}
            className="inline-flex size-11 items-center justify-center rounded-full bg-marigold-200 text-jamun-900"
          >
            <FlaskConical className="size-5" />
          </motion.span>
          <DialogTitle className="mt-4 font-display text-[1.5rem] leading-tight font-normal text-jamun-900">
            Demo checkout — no payment will be taken
          </DialogTitle>
          <DialogDescription className="mt-2 text-[0.9875rem] leading-snug text-muted">
            This site is in demo mode, so this step stands in for the payment window. No card, UPI or bank details are
            needed and nothing is charged.
          </DialogDescription>
        </DialogHeader>

        {details ? (
          <dl className="mt-6 divide-y divide-line rounded-xl border border-line bg-paper text-[0.9375rem]">
            <div className="flex items-baseline justify-between gap-4 px-4 py-3">
              <dt className="text-muted">Item</dt>
              <dd className="text-right font-semibold text-jamun-900">{details.item}</dd>
            </div>
            {details.amount !== undefined ? (
              <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                <dt className="text-muted">Amount</dt>
                <dd className="text-right font-display text-2xl leading-none text-jamun-900">{formatINR(details.amount)}</dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-4 px-4 py-3">
              <dt className="text-muted">Demo reference</dt>
              <dd className="text-right font-medium tracking-wide break-all text-ink">{details.reference}</dd>
            </div>
          </dl>
        ) : null}

        <DialogFooter className="mt-7 flex-col gap-3 sm:flex-row-reverse sm:justify-start">
          <Button size="lg" arrow onClick={onComplete} className="w-full sm:w-auto">
            Complete demo payment
          </Button>
          <Button variant="outline" size="lg" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
