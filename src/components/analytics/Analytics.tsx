"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Meta Pixel and Google Analytics 4, each loaded only when its ID is set:
 *   NEXT_PUBLIC_META_PIXEL_ID   e.g. 123456789012345
 *   NEXT_PUBLIC_GA_ID           e.g. G-XXXXXXXXXX
 * Renders nothing when neither is set.
 *
 * Page views
 * - Meta Pixel: the base code tracks the first page view. Its automatic
 *   history tracking is switched off (disablePushState) and <PixelPageViews>
 *   sends one PageView per client-side route change instead, so nothing is
 *   counted twice.
 * - GA4: `config` records the first page view; route changes are recorded by
 *   GA4's Enhanced measurement ("Page changes based on browser history
 *   events"), which is on by default. Keep it on (see docs/SETUP.md).
 *
 * Conversion events go through track() in src/lib/analytics.ts, which uses
 * the window.fbq and window.gtag globals defined here.
 */

/** Only accept well-formed IDs, since they are written into inline scripts. */
function validId(value: string | undefined, pattern: RegExp): string | null {
  const id = value?.trim();
  return id && pattern.test(id) ? id : null;
}

const PIXEL_ID = validId(process.env.NEXT_PUBLIC_META_PIXEL_ID, /^\d{6,20}$/);
const GA_ID = validId(process.env.NEXT_PUBLIC_GA_ID, /^G-[A-Z0-9]{4,16}$/i);

const pixelSnippet = (id: string) => `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq.disablePushState=true;
fbq('init',${JSON.stringify(id)});
fbq('track','PageView');
`;

const gaSnippet = (id: string) => `
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js',new Date());
gtag('config',${JSON.stringify(id)});
`;

/** Sends a Meta Pixel PageView on each client-side navigation (not on first load). */
function PixelPageViews() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === null) {
      lastPath.current = pathname; // the base code already tracked this one
      return;
    }
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
    try {
      fbq?.("track", "PageView");
    } catch {
      // Analytics must never break the page.
    }
  }, [pathname]);

  return null;
}

export function Analytics() {
  if (!PIXEL_ID && !GA_ID) return null;

  return (
    <>
      {PIXEL_ID ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: pixelSnippet(PIXEL_ID) }} />
          <PixelPageViews />
        </>
      ) : null}
      {GA_ID ? (
        <>
          <Script
            id="ga4-loader"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`}
          />
          <Script id="ga4-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: gaSnippet(GA_ID) }} />
        </>
      ) : null}
    </>
  );
}
