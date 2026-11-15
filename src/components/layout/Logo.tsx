import Link from "next/link";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * Wordmark. "Shift" sits a little above the baseline: the brand's one
 * typographic joke, used only here.
 */
export function Logo({ tone = "light", className }: { tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  return (
    <Link
      href="/"
      className={cn("inline-flex flex-col leading-none", className)}
      aria-label={`${site.brand} with ${site.coach}, home`}
    >
      <span
        className={cn(
          "font-display text-[1.375rem] whitespace-nowrap sm:text-2xl",
          dark ? "text-white" : "text-jamun-900",
        )}
      >
        The Power{" "}
        <span className={cn("relative -top-[0.18em] inline-block", dark ? "text-marigold-400" : "text-marigold-500")}>
          Shift
        </span>
      </span>
      <span
        className={cn(
          "eyebrow mt-0.5 text-[0.625rem] tracking-[0.2em] whitespace-nowrap",
          dark ? "text-jamun-200" : "text-muted",
        )}
      >
        with {site.coach}
      </span>
    </Link>
  );
}
