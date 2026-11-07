"use client";

import { useState } from "react";
import { Printer, Share2 } from "lucide-react";
import { assessmentCopy, statements } from "@/content/assessment";
import { absoluteUrl } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * Save as PDF (the browser's print dialog; print styles hide the site chrome)
 * and share. Sharing only ever sends the link to the assessment, never results.
 */
export function ResultActions({ className }: { className?: string }) {
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "manual">("idle");
  const url = absoluteUrl("/assessment");

  async function share() {
    const data = {
      title: assessmentCopy.title,
      text: `Where is your power leaking? A free self-assessment by Manisha Agrawal: ${statements.length} statements, about ${assessmentCopy.minutes} minutes.`,
      url,
    };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(data);
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Fall through to copying the link.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
    } catch {
      setShareStatus("manual");
    }
  }

  return (
    <div data-print="hide" className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" className="min-h-11" icon={<Printer aria-hidden="true" />} onClick={() => window.print()}>
          Save as PDF
        </Button>
        <Button variant="outline" size="sm" className="min-h-11" icon={<Share2 aria-hidden="true" />} onClick={share}>
          Share the assessment
        </Button>
      </div>
      <p aria-live="polite" className="text-sm text-muted">
        {shareStatus === "copied" ? "Link to the assessment copied. Your own results stay private." : ""}
      </p>
      {shareStatus === "manual" ? (
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Copy this link to share the assessment:
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base text-ink"
          />
        </label>
      ) : null}
    </div>
  );
}
