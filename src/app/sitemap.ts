import type { MetadataRoute } from "next";
import { absoluteUrl, site } from "@/content/site";
import { programs } from "@/content/programs";
import { products } from "@/content/merch";

/**
 * Every public, indexable page. Transactional pages (cart, checkout, enroll,
 * order and thank-you pages) are left out on purpose; robots.ts disallows them.
 */

const pages = [
  "/",
  "/about",
  "/programs",
  "/courses",
  "/masterclass",
  "/leadership-workshop",
  "/corporate",
  "/assessment",
  "/book",
  "/merch",
  "/contact",
];

const policies = ["/privacy-policy", "/terms", "/refund-policy", "/shipping-policy"];

export default function sitemap(): MetadataRoute.Sitemap {
  const policyDate = new Date(`${site.legal.lastUpdated}T00:00:00+05:30`);

  return [
    ...pages.map((path) => ({ url: absoluteUrl(path) })),
    // Programs with their own landing page (/masterclass, /leadership-workshop) are listed there:
    // /programs/<slug> declares that page as canonical. Corporate training lives at /corporate.
    ...programs
      .filter((p) => p.mode !== "enquiry" && !p.landingPath && !p.course)
      .map((p) => ({ url: absoluteUrl(`/programs/${p.slug}`) })),
    ...programs.filter((p) => p.course).map((p) => ({ url: absoluteUrl(`/courses/${p.slug}`) })),
    ...products.map((p) => ({ url: absoluteUrl(`/merch/${p.slug}`) })),
    ...policies.map((path) => ({ url: absoluteUrl(path), lastModified: policyDate })),
  ];
}
