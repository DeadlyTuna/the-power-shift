"use client";

import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { track } from "@/lib/analytics";

/**
 * The scheduling page (Calendly, Cal.com…) embedded inline, with a direct
 * link for when the frame is blocked or slow. Calendly reports a completed
 * booking with a postMessage, which we count as a "Schedule" conversion.
 */

const CALENDLY_ORIGIN = /^https:\/\/([a-z0-9-]+\.)?calendly\.com$/;

/** Calendly only posts booking events to the parent when told which domain embeds it. */
function embedSrc(url: string, embedDomain: string): string {
  try {
    const parsed = new URL(url);
    if (CALENDLY_ORIGIN.test(parsed.origin)) {
      parsed.searchParams.set("embed_domain", embedDomain);
      parsed.searchParams.set("embed_type", "Inline");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function BookingEmbed({ url, embedDomain }: { url: string; embedDomain: string }) {
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!CALENDLY_ORIGIN.test(event.origin)) return;
      const data = event.data as { event?: unknown } | null;
      if (data && data.event === "calendly.event_scheduled") track("Schedule", { source: "book-embed" });
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <iframe
        src={embedSrc(url, embedDomain)}
        title="Choose a time for your clarity call with Manisha Agrawal"
        loading="lazy"
        className="h-[44rem] w-full rounded-card border border-line bg-white sm:h-[46rem]"
      />
      <p className="text-[0.9375rem] text-muted">
        Calendar not loading?{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900"
        >
          Open the booking page in a new tab
          <ExternalLink aria-hidden="true" className="size-4" />
        </a>
      </p>
    </div>
  );
}
