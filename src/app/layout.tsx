import type { Metadata, Viewport } from "next";
import { site } from "@/content/site";
import { CartProvider } from "@/components/cart/CartProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { Analytics } from "@/components/analytics/Analytics";
import { Toaster } from "@/components/kit/sonner";
import { TooltipProvider } from "@/components/kit/tooltip";
import { MotionProvider } from "@/components/motion/MotionProvider";

/*
 * Three faces from Indian foundries, all with Devanagari support so Hindi
 * copy (and the ₹ sign) renders in the same families:
 *   Rozha One (display), Mukta (body and UI), Kalam (the handwritten shift).
 * Self-hosted via Fontsource so builds never depend on reaching Google Fonts.
 */
import "@fontsource/rozha-one/400.css";
import "@fontsource/mukta/400.css";
import "@fontsource/mukta/500.css";
import "@fontsource/mukta/600.css";
import "@fontsource/mukta/700.css";
import "@fontsource/kalam/400.css";
import "@fontsource/kalam/700.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.brand} · ${site.coach}, ${site.role}`,
    template: `%s · ${site.brand}`,
  },
  description: site.description,
  applicationName: site.brand,
  authors: [{ name: site.coach }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: site.brand,
    title: `${site.brand} · ${site.coach}`,
    description: site.description,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#2a1636",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* Marks JS as available before first paint so progressive-enhancement styles apply without a flash. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <MotionProvider>
          <TooltipProvider delayDuration={200}>
            <CartProvider>
              <AnnouncementBar />
              <SiteHeader />
              <main id="main" className="flex-1">
                {children}
              </main>
              <SiteFooter />
              <WhatsAppFloat />
              <Toaster position="bottom-center" />
            </CartProvider>
          </TooltipProvider>
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
