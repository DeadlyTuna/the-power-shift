import type { Metadata } from "next";
import type { ReactNode } from "react";

/** The demo student area is private to each browser: keep every page out of search results. */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return children;
}
