import type { Metadata } from "next";
import { absoluteUrl, credentials, site } from "@/content/site";
import { isEventOpen, type Program } from "@/content/programs";
import type { Product } from "@/content/merch";

/**
 * schema.org builders and a metadata helper. Render the JSON-LD with
 * <JsonLd data={...} /> from "@/components/shared/JsonLd".
 */

export function pageMetadata({
  title,
  description,
  path,
  noindex,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  // Next merges metadata shallowly, so openGraph/twitter must repeat the shared image.
  const image = { url: "/opengraph-image", width: 1200, height: 630, alt: `${site.brand} with ${site.coach}` };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: absoluteUrl(path), siteName: site.brand, locale: "en_IN", type: "website", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl("/#person"),
    name: site.coach,
    jobTitle: site.role,
    url: site.url,
    email: `mailto:${site.contact.email}`,
    telephone: site.contact.phoneE164,
    description: `${credentials.corporateYears} years of corporate leadership across ${credentials.countries.join(", ")}; ${credentials.coachingYears} years of coaching. ${credentials.education}.`,
    alumniOf: { "@type": "CollegeOrUniversity", name: "IIIT Bangalore" },
    sameAs: Object.values(site.social).filter(Boolean),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": absoluteUrl("/#business"),
    name: site.brand,
    url: site.url,
    description: site.description,
    founder: { "@id": absoluteUrl("/#person") },
    telephone: site.contact.phoneE164,
    email: site.contact.email,
    areaServed: "IN",
    sameAs: Object.values(site.social).filter(Boolean),
  };
}

/** Pages using this should revalidate so the offer disappears once the event has started. */
export function eventJsonLd(program: Program) {
  if (!program.event) return null;
  const open = isEventOpen(program);
  const start = new Date(program.event.startsAt);
  const end = new Date(start.getTime() + program.event.durationMinutes * 60_000);
  const path = program.landingPath ?? `/programs/${program.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: program.title,
    description: program.summary,
    startDate: program.event.startsAt,
    endDate: end.toISOString(),
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    inLanguage: program.event.language,
    location: { "@type": "VirtualLocation", url: absoluteUrl(path) },
    organizer: { "@id": absoluteUrl("/#person"), "@type": "Person", name: site.coach, url: site.url },
    performer: { "@type": "Person", name: site.coach },
    ...(open
      ? {
          offers: {
            "@type": "Offer",
            price: program.price?.amount ?? 0,
            priceCurrency: "INR",
            availability: "https://schema.org/InStock",
            url: absoluteUrl(path),
          },
        }
      : {}),
  };
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    category: product.category,
    brand: { "@type": "Brand", name: site.brand },
    ...(product.image ? { image: absoluteUrl(product.image) } : {}),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "INR",
      availability: product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/merch/${product.slug}`),
    },
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
