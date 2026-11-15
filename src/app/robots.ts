import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/content/site";

/** Crawl everything public; keep crawlers out of the API and transactional pages. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/checkout", "/cart", "/order/", "/thank-you", "/enroll/"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
