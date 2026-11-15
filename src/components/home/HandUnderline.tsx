import type { ReactNode } from "react";
import { Highlighter } from "@/components/kit/highlighter";

/**
 * A hand-drawn marigold underline (Magic UI Highlighter, rough-notation)
 * drawn once, the first time the phrase scrolls into view. Keep the phrase
 * short: it doesn't wrap.
 *
 * rough-notation inserts its SVG next to the phrase and positions it
 * absolutely, so this wrapper is the SVG's positioned parent; otherwise the
 * line would jump when a surrounding Reveal finishes and drops its transform.
 * Without JavaScript the phrase simply has no underline.
 */
export function HandUnderline({ children, color = "#f2a93b" }: { children: ReactNode; color?: string }) {
  return (
    <span className="relative inline-block">
      <Highlighter action="underline" color={color} strokeWidth={2.5} padding={1} animationDuration={900} isView>
        {children}
      </Highlighter>
    </span>
  );
}
