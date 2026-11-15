import Link from "next/link";
import type { ReactNode } from "react";
import { footerNav, site, whatsappLink } from "@/content/site";
import { formatShortDate } from "@/lib/format";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/shared/JsonLd";
import { Container, Section } from "@/components/ui/Layout";
import { EmailLink, PhoneLink } from "./bits";

/**
 * Shared layout for the policy pages: title, last-updated date, a short
 * summary, a table of contents built from the section titles, and readable
 * prose. Prints cleanly (navigation and the contact box are hidden).
 */

export type LegalSection = {
  /** Anchor id, also used for the table of contents. Keep it stable: people link to these. */
  id: string;
  title: string;
  body: ReactNode;
};

/** Underlined links inside policy text. */
const linkStyles =
  "[&_a]:font-medium [&_a]:text-jamun-900 [&_a]:underline [&_a]:decoration-marigold-400 [&_a]:decoration-2 [&_a]:underline-offset-4 [&_a]:hover:decoration-jamun-900";

/** Prose styles for policy text: ~70ch measure, generous spacing, underlined links. */
export const legalProse = [
  "space-y-4 text-[1.0625rem] leading-relaxed text-ink",
  linkStyles,
  "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_li]:pl-1 [&_li::marker]:text-marigold-700",
  "[&_h3]:pt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-jamun-900",
  "[&_strong]:font-semibold [&_strong]:text-jamun-900",
  "[&_blockquote]:border-l-4 [&_blockquote]:border-marigold-400 [&_blockquote]:bg-white [&_blockquote]:py-3 [&_blockquote]:pr-4 [&_blockquote]:pl-5 [&_blockquote]:text-jamun-900",
].join(" ");

function Toc({ sections, compact }: { sections: LegalSection[]; compact?: boolean }) {
  return (
    <ol className={compact ? "mt-3 flex flex-col" : "mt-4 flex flex-col gap-1"}>
      {sections.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className={
              compact
                ? "flex min-h-11 items-baseline gap-3 py-2.5 text-[0.9875rem] text-jamun-900 hover:underline"
                : "flex items-baseline gap-3 rounded-md py-1.5 text-[0.9375rem] leading-snug text-muted transition-colors hover:text-jamun-900"
            }
          >
            <span className="w-5 shrink-0 text-right text-sm text-muted tabular-nums">{i + 1}.</span>
            <span>{s.title}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

export function LegalPage({
  title,
  path,
  intro,
  summary,
  sections,
}: {
  title: string;
  /** This page's path, e.g. "/terms". */
  path: string;
  intro?: ReactNode;
  /** Three to six plain-language points shown in the "short version" box. */
  summary: ReactNode[];
  sections: LegalSection[];
}) {
  const updated = site.legal.lastUpdated;
  const otherPolicies = (footerNav.find((g) => g.heading === "Policies")?.links ?? []).filter((l) => l.href !== path);

  return (
    <article>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: title, path },
        ])}
      />

      <Section tone="white" className="border-b border-line py-14 md:py-20 print:py-6">
        <p className="eyebrow text-marigold-700">Policies</p>
        <h1 className="display-lg mt-4 max-w-3xl">{title}</h1>
        <p className="mt-5 text-[0.9875rem] text-muted">
          Last updated <time dateTime={updated}>{formatShortDate(updated)}</time>
        </p>
        {intro ? <div className="lede mt-6 max-w-[62ch] text-muted">{intro}</div> : null}
      </Section>

      <Container className="py-12 md:py-16 print:py-6">
        <div className="grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-16">
          <aside
            data-print="hide"
            className="hidden lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:block lg:self-start lg:sticky lg:top-28"
          >
            <nav aria-label="On this page">
              <p className="eyebrow text-[0.75rem] text-muted">On this page</p>
              <Toc sections={sections} />
            </nav>
          </aside>

          <section
            aria-labelledby="legal-summary"
            className="max-w-[70ch] rounded-card border border-line bg-mist p-6 sm:p-8 lg:col-start-2 print:border-ink/30 print:bg-white"
          >
            <h2 id="legal-summary" className="display-sm">
              The short version
            </h2>
            <ul className={`mt-4 flex flex-col gap-3 ${linkStyles}`}>
              {summary.map((point, i) => (
                <li key={i} className="flex gap-3 leading-relaxed">
                  <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-marigold-700" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[0.9375rem] text-muted">
              This summary helps you find your way. The full text below is what applies.
            </p>
          </section>

          <details
            data-print="hide"
            className="group max-w-[70ch] rounded-card border border-line bg-white px-5 lg:hidden"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 font-semibold text-jamun-900 [&::-webkit-details-marker]:hidden">
              <span>On this page</span>
              <span aria-hidden="true" className="text-xl leading-none text-muted transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <nav aria-label="On this page" className="border-t border-line pb-2">
              <Toc sections={sections} compact />
            </nav>
          </details>

          <div className="min-w-0 max-w-[70ch] lg:col-start-2">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                aria-labelledby={`${s.id}-title`}
                className="mt-10 scroll-mt-28 border-t border-line pt-10 first:mt-0 first:border-t-0 first:pt-0"
              >
                <h2 id={`${s.id}-title`} className="display-sm">
                  <span className="mr-1 text-muted tabular-nums">{i + 1}.</span> {s.title}
                </h2>
                <div className={`${legalProse} mt-5`}>{s.body}</div>
              </section>
            ))}

            <aside
              data-print="hide"
              aria-labelledby="legal-questions"
              className="mt-14 rounded-card border border-line bg-white p-6 sm:p-8"
            >
              <h2 id="legal-questions" className="display-sm">
                Questions about this page?
              </h2>
              <div className={`${legalProse} mt-3`}>
                <p>
                  Email <EmailLink /> or call <PhoneLink />. You can also{" "}
                  <a href={whatsappLink("Hi, I have a question about your policies.")} target="_blank" rel="noopener noreferrer">
                    message us on WhatsApp
                  </a>
                  . Our hours are {site.contact.hours}.
                </p>
              </div>
              {otherPolicies.length ? (
                <nav aria-label="Other policies" className="mt-6 border-t border-line pt-5">
                  <p className="eyebrow text-[0.75rem] text-muted">Other policies</p>
                  <ul className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:gap-x-6">
                    {otherPolicies.map((l) => (
                      <li key={l.href}>
                        <Link
                          href={l.href}
                          className="inline-flex min-h-11 items-center font-medium text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}
            </aside>
          </div>
        </div>
      </Container>
    </article>
  );
}
