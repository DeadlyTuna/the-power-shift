import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowLeft, LockKeyhole, ShieldCheck, UserRoundCheck } from "lucide-react";
import { enrollablePrograms, getProgram, type Program } from "@/content/programs";
import { site, whatsappLink } from "@/content/site";
import { EnrollForm } from "@/components/enroll/EnrollForm";
import { EventCountdown } from "@/components/enroll/EventCountdown";
import { WhileOpen } from "@/components/enroll/WhileOpen";
import { FaqList } from "@/components/shared/FaqList";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Badge, Card, Container } from "@/components/ui/Layout";
import { cn } from "@/lib/cn";
import { formatDuration, formatEventDate, formatEventTime, formatINR } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

/**
 * /enroll/[slug]: a focused enrollment page for one program. Linked from
 * program pages and ads. Time-dependent parts (open vs waitlist, countdown)
 * are decided in the browser by EnrollForm and EventCountdown, so this page
 * can be built statically without ever going stale.
 */

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return enrollablePrograms.filter((program) => !program.course).map((program) => ({ slug: program.slug }));
}

function pageTitle(program: Program) {
  return program.mode === "application" ? `Apply: ${program.shortTitle}` : `Register: ${program.shortTitle}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program || program.mode === "enquiry") return { robots: { index: false, follow: true } };
  return pageMetadata({
    title: pageTitle(program),
    description: program.promise,
    path: `/enroll/${program.slug}`,
    noindex: true,
  });
}

function priceBadge(program: Program) {
  if (program.mode === "free") return <Badge tone="peacock">Free</Badge>;
  if (program.mode === "paid" && program.price) return <Badge tone="marigold">{formatINR(program.price.amount)}</Badge>;
  return (
    <Badge tone="outline" className="text-jamun-900">
      By application
    </Badge>
  );
}

type Fact = { label: string; value: string; wide?: boolean };

/** The facts someone needs before registering, kept short so the form starts near the top on phones. */
function keyFacts(program: Program): Fact[] {
  const event = program.event;
  if (!event) return program.format.map((item) => ({ label: item.label, value: item.value }));
  return [
    { label: "Date", value: formatEventDate(event.startsAt), wide: true },
    { label: "Time", value: formatEventTime(event.startsAt) },
    { label: "Duration", value: formatDuration(event.durationMinutes) },
    { label: "Where", value: `Live on ${event.platform}` },
    { label: "Language", value: event.language },
  ];
}

/** Secondary event facts, shown below the form on phones. */
function moreFacts(program: Program): Fact[] {
  const event = program.event;
  if (!event) return [];
  const list: Fact[] = [];
  if (event.capacity) list.push({ label: "Seats", value: `Limited to ${event.capacity}` });
  list.push({ label: "Recording", value: event.recordingAvailable ? "Available after the session" : "None, please attend live" });
  // A fact left alone on its row gets the full width instead of half.
  if (list.length % 2 === 1) list[list.length - 1] = { ...list[list.length - 1], wide: true };
  return list;
}

function Facts({ facts, className }: { facts: Fact[]; className?: string }) {
  return (
    <dl className={cn("grid max-w-xl grid-cols-2 gap-x-6 gap-y-3.5", className)}>
      {facts.map((fact) => (
        <div key={fact.label} className={fact.wide ? "col-span-2" : undefined}>
          <dt className="text-sm text-muted">{fact.label}</dt>
          <dd className="font-semibold text-jamun-900">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function TrustItem({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3.5">
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-mist text-jamun-800 [&>svg]:size-[1.125rem]"
      >
        {icon}
      </span>
      <div>
        <p className="font-semibold text-jamun-900">{title}</p>
        <p className="text-[0.9375rem] leading-snug text-muted">{children}</p>
      </div>
    </li>
  );
}

const inlineLink =
  "font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-2 hover:decoration-jamun-900";

export default async function EnrollPage({ params }: Props) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();
  if (program.mode === "enquiry") redirect("/corporate");
  // Courses are bought from their course page (it needs a signed-in student).
  if (program.course) redirect(`/courses/${program.slug}`);

  const backHref = program.landingPath ?? `/programs/${program.slug}`;
  const faqs = program.faqs.slice(0, 3);
  const isEvent = program.mode === "free" || program.mode === "paid";

  return (
    <Container className="pt-5 pb-20 md:pt-8 md:pb-28">
      <Link
        href={backHref}
        className="-ml-1 inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-[0.9375rem] font-semibold text-jamun-900 hover:text-jamun-700"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to {program.shortTitle}
      </Link>

      <div className="mt-3 grid gap-8 lg:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] lg:gap-x-16 lg:gap-y-12">
        {/* Summary: compact so the form starts near the top on phones. */}
        <header className="lg:col-start-1 lg:row-start-1">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="eyebrow text-marigold-700">{program.audience}</p>
            {priceBadge(program)}
          </div>
          <h1 className="display-md mt-3 text-jamun-900">{program.title}</h1>
          <p className="mt-3 max-w-xl leading-snug text-muted sm:text-[1.0625rem]">{program.promise}</p>
          <Facts facts={keyFacts(program)} className="mt-5 border-t border-line pt-5" />
        </header>

        {/* The form: second on phones, a sticky right-hand column on desktop. */}
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <Card className="p-5 sm:p-8 lg:sticky lg:top-24">
            <h2 className="display-sm text-jamun-900">{isEvent ? "Your details" : "Your application"}</h2>
            <EnrollForm program={program} source="enroll-page" idPrefix="enroll" className="mt-6" />
          </Card>
        </div>

        <div className="flex flex-col gap-12 lg:col-start-1 lg:row-start-2">
          {program.event ? (
            <div className="flex flex-col gap-6">
              <EventCountdown startsAt={program.event.startsAt} />
              <Facts facts={moreFacts(program)} />
            </div>
          ) : null}

          <section aria-labelledby="enroll-trust">
            <h2 id="enroll-trust" className="sr-only">
              Before you enroll
            </h2>
            <ul className="flex max-w-xl flex-col gap-5">
              {program.mode === "paid" ? (
                // Payment notes stop applying once the form has switched to the waitlist.
                <WhileOpen startsAt={program.event?.startsAt}>
                  {program.guarantee ? (
                    <TrustItem icon={<ShieldCheck />} title="Money-back guarantee">
                      Your seat is covered by a money-back guarantee. Read the{" "}
                      <Link href="/refund-policy" className={inlineLink}>
                        refund policy
                      </Link>
                      .
                    </TrustItem>
                  ) : null}
                  <TrustItem icon={<LockKeyhole />} title="Secure payment">
                    Payments are processed by Razorpay, so your card and UPI details never reach this website.
                  </TrustItem>
                </WhileOpen>
              ) : null}
              <TrustItem icon={<UserRoundCheck />} title="Your privacy">
                We use your details for this {isEvent ? "registration" : "application"} and never sell them. Read the{" "}
                <Link href="/privacy-policy" className={inlineLink}>
                  privacy policy
                </Link>
                .
              </TrustItem>
              <TrustItem icon={<WhatsAppIcon />} title="Questions first?">
                <a
                  href={whatsappLink(`Hi, I have a question about the ${program.shortTitle}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={inlineLink}
                >
                  Message us on WhatsApp<span className="sr-only"> (opens in a new tab)</span>
                </a>{" "}
                at {site.contact.phoneDisplay}, {site.contact.hours}.
              </TrustItem>
            </ul>
          </section>

          {faqs.length > 0 ? (
            <section aria-labelledby="enroll-faq" className="max-w-xl">
              <h2 id="enroll-faq" className="display-sm text-jamun-900">
                Common questions
              </h2>
              <FaqList faqs={faqs} size="sm" className="mt-4" />
            </section>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
