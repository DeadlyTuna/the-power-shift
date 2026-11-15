"use client";

import { useEffect, useState } from "react";
import type { ApiError } from "@/lib/http";

/**
 * Shared submit state for the enrollment forms: pending flag, inline field
 * errors from the API's `fields` map, and a form-level alert that receives
 * focus whenever it is (re)shown so screen readers announce it.
 */

export type AlertState = {
  tone: "error" | "info";
  title?: string;
  message: string;
  /** Show a "Return to payment" action (paid checkout dismissed). */
  retryPayment?: boolean;
};

export function useFormState(alertId: string, knownFields: readonly string[]) {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [alertSeq, setAlertSeq] = useState(0);

  // Move focus to the alert every time one is shown.
  useEffect(() => {
    if (alertSeq > 0) document.getElementById(alertId)?.focus();
  }, [alertSeq, alertId]);

  // Coming back from a hosted payment page via the back button restores this
  // page from the bfcache with the button still pending; release it.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setPending(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  function showAlert(next: AlertState) {
    setAlert(next);
    setAlertSeq((n) => n + 1);
    setPending(false);
  }

  return {
    pending,
    errors,
    alert,
    begin() {
      setPending(true);
      setAlert(null);
      setErrors({});
    },
    end() {
      setPending(false);
    },
    showAlert,
    /** Show an API failure: inline errors for fields on this form, the message in the alert. */
    fail(result: ApiError) {
      const fields = result.fields ?? {};
      const inline: Record<string, string> = {};
      let other: string | undefined;
      for (const [key, message] of Object.entries(fields)) {
        if (knownFields.includes(key)) inline[key] = message;
        else if (!other && key !== "event") other = message;
      }
      setErrors(inline);
      const hasInline = Object.keys(inline).length > 0;
      showAlert({ tone: "error", message: !hasInline && other ? other : result.error });
    },
    clearError(name: string) {
      setErrors((prev) => {
        if (!(name in prev)) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
    },
  };
}

/** Read a text value from FormData. */
export function textValue(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}

/** Name of the control that fired a form-level change event, if any. */
export function changedFieldName(target: EventTarget): string | null {
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return target.name || null;
  }
  return null;
}
