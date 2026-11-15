import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, ChevronRight, Minus, ShieldCheck } from "lucide-react";
import { getProgram, isEventOpen, programs, type Program } from "@/content/programs";
import { whatsappLink } from "@/content/site";
import { EnrollForm } from "@/components/enroll/EnrollForm";
import { EventCountdown } from "@/components/enroll/EventCountdown";
import { EventAwareText, EventStatus, WhenEventClosed } from "@/components/programs/EventState";
import { FaqList } from "@/components/shared/FaqList";
import { StickyEnrollBar } from "@/components/programs/StickyEnrollBar";
import {
  enrollCtaLabels,
  enrollHeadings,
  eventWhen,
  formatValue,
  priceIsFigure,
  priceLabel,
  primaryPattern,
  testimonialsFor,
} from "@/components/programs/program-helpers";
import { JsonLd } from "@/components/shared/JsonLd";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Card, Section, SectionHeading, type SectionTone } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";
import { formatEventDate, formatEventTime } from "@/lib/format";
import { breadcrumbJsonLd, eventJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

/*
 * Open vs waitlist is decided at render time on the server (refreshed every
 * five minutes) and re-checked in the browser, so it never sticks at build time.
 */
export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

/** Corporate training has its own landing page at /corporate, so it is not prerendered here. */
export function generateStaticParams() {
  return programs.filter((p) => p.mode !== "enquiry" && !p.course).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program || program.mode === "enquiry") return {};
  return pageMetadata({
    title: program.title,
    description: program.summary,
    // Events with a long-form landing page point search engines there, so the two pages don't compete.
    path: program.landingPath ?? `/programs/${program.slug}`,
  });
}

const HERO_CTA_ID = "program-hero-cta";

/** The prefilled WhatsApp message for questions about a program, used by every WhatsApp link on the page. */
function questionMessage(program: Program) {
  return `Hi Manisha, I have a question about ${program.title}.`;
}

export default async function ProgramPage({ params }: Params) {
  const { slug } = await params;
  const program = getProgram(slug);
  if (!program) notFound();
  if (program.mode === "enquiry") redirect("/corporate");
  // Self-paced courses have their own pages.
  if (program.course) redirect(`/courses/${program.slug}`);

  const open = isEventOpen(program);
  const labels = enrollCtaLabels(program);
  const ctaLabel = program.event ? (
    <EventAwareText startsAt={program.event.startsAt} serverGuess={open} open={labels.open} closed={labels.closed} />
  ) : (
    labels.open
  );

  // Middle sections are optional per program; tones alternate so neighbours never match.
  const middle: { key: string; render: (tone: SectionTone) => ReactNode }[] = [];
  const pattern = primaryPattern(program);
  if (pattern) middle.push({ key: "pattern", render: (tone) => <PatternSection tone={tone} {...pattern} /> });
  if (program.outcomes.length) middle.push({ key: "outcomes", render: (tone) => <OutcomesSection tone={tone} program={program} /> });
  if (program.agenda?.length) middle.push({ key: "agenda", render: (tone) => <AgendaSection tone={tone} program={program} /> });
  if (program.forYou?.length || program.notForYou?.length)
    middle.push({ key: "fit", render: (tone) => <FitSection tone={tone} program={program} /> });
  if (program.guarantee) middle.push({ key: "guarantee", render: (tone) => <GuaranteeSection tone={tone} program={program} /> });
  const stories = testimonialsFor(program);
  if (stories.length)
    middle.push({
      key: "testimonials",
      render: (tone) => (
        <Section tone={tone} aria-labelledby="stories-title">
          <SectionHeading
            eyebrow="In their words"
            title={<span id="stories-title">What clients say about working with Manisha</span>}
            intro="Each story is labelled with the coaching or session it came from."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {stories.map((t) => (
              <TestimonialCard key={t.id} testimonial={t} />
            ))}
          </div>
        </Section>
      ),
    });
  if (program.faqs.length) middle.push({ key: "faqs", render: (tone) => <FaqSection tone={tone} program={program} /> });

  const jsonLd = [
    eventJsonLd(program),
    program.faqs.length ? faqJsonLd(program.faqs) : null,
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Programs", path: "/programs" },
      { name: program.title, path: `/programs/${program.slug}` },
    ]),
  ].filter((d): d is NonNullable<typeof d> => d !== null);

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <Section tone="paper" className="pt-8 pb-16 md:pt-12 md:pb-24" aria-labelledby="program-title">
        <nav aria-label="Breadcrumb" className="text-[0.9375rem] text-muted">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <li>
              <Link href="/programs" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-jamun-900 hover:underline">
                Programs
              </Link>
            </li>
            <li className="inline-flex items-center gap-1.5">
              <ChevronRight aria-hidden="true" className="size-4" />
              <span aria-current="page" className="text-ink">
                {program.shortTitle}
              </span>
            </li>
          </ol>
        </nav>

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow text-marigold-700">{program.audience}</p>
            <h1 id="program-title" className="display-lg mt-4">
              {program.title}
            </h1>
            <p className="lede mt-6 max-w-2xl text-ink">{program.promise}</p>
            <p className="mt-5 max-w-2xl text-muted">{program.summary}</p>
            {program.landingPath ? (
              <p className="mt-6">
                <ButtonLink href={program.landingPath} variant="link" arrow className="min-h-11">
                  See the full page<span className="sr-only"> for {program.title}</span>
                </ButtonLink>
              </p>
            ) : null}
          </div>

          <FactsCard program={program} open={open} ctaLabel={ctaLabel} />
        </div>
      </Section>

      {middle.map((section, i) => (
        <Fragment key={section.key}>{section.render(i % 2 === 0 ? "white" : "paper")}</Fragment>
      ))}

      <EnrollSection program={program} open={open} />

      <StickyEnrollBar watchId={HERO_CTA_ID} whatsappMessage={questionMessage(program)} source="program-sticky-bar">
        {ctaLabel}
      </StickyEnrollBar>
    </>
  );
}

/* ---------- Sections ---------- */

function FactsCard({ program, open, ctaLabel }: { program: Program; open: boolean; ctaLabel: ReactNode }) {
  const { event } = program;
  const price = priceLabel(program);

  return (
    <Card className="p-6 sm:p-8 lg:sticky lg:top-28">
      <div className="flex min-h-7 flex-wrap items-center justify-between gap-3">
        <p className="eyebrow text-marigold-700">{event ? "Live online" : "How it starts"}</p>
        {event ? <EventStatus startsAt={event.startsAt} serverGuess={open} /> : null}
      </div>

      {/* Figures only ("Free", "₹9"); coaching programs state their investment in the format list instead. */}
      {price && priceIsFigure(program) ? (
        <p className="mt-4 font-display text-5xl leading-none text-jamun-900">
          <span className="sr-only">Price: </span>
          {price}
        </p>
      ) : null}
      {program.price?.anchor ? <p className="mt-3 text-sm text-muted">{program.price.anchor}</p> : null}

      <dl className="mt-6 divide-y divide-line border-y border-line text-[0.9375rem]">
        {event ? (
          <>
            <FactRow
              label={<EventAwareText startsAt={event.startsAt} serverGuess={open} open="Date" closed="Last session" />}
              value={formatEventDate(event.startsAt)}
            />
            <FactRow label="Time" value={formatEventTime(event.startsAt)} />
          </>
        ) : null}
        {program.format.map((f) => (
          <FactRow key={f.label} label={f.label} value={f.value} />
        ))}
      </dl>

      <div id={HERO_CTA_ID} className="mt-6">
        <ButtonLink href="#enroll" size="lg" arrow className="w-full">
          {ctaLabel}
        </ButtonLink>
        {event ? (
          <WhenEventClosed startsAt={event.startsAt} serverGuess={open}>
            <p className="mt-3 text-sm text-muted">
              This date has passed. Join the waitlist and we&apos;ll let you know when the next date is announced.
            </p>
          </WhenEventClosed>
        ) : (
          <p className="mt-3 text-sm text-muted">After you apply, Manisha&apos;s team will reach out to book your free clarity call.</p>
        )}
      </div>

      {event ? <EventCountdown startsAt={event.startsAt} className="mt-6" /> : null}
    </Card>
  );
}

function FactRow({ label, value }: { label: ReactNode; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function PatternSection({
  tone,
  pattern,
  statement,
}: { tone: SectionTone } & NonNullable<ReturnType<typeof primaryPattern>>) {
  return (
    <Section tone={tone} aria-labelledby="pattern-title">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="eyebrow text-marigold-700">The pattern this works on</p>
          <h2 id="pattern-title" className="display-md mt-4">
            {pattern.name}
          </h2>
          <p className="mt-5 text-muted">{pattern.looksLike}</p>
          <p className="mt-4 text-muted">
            <span className="font-semibold text-ink">What it costs you: </span>
            {pattern.cost}
          </p>
          <ButtonLink href="/assessment" variant="link" arrow className="mt-6 min-h-11">
            Take the free Power Self-Assessment
          </ButtonLink>
        </div>
        <div className={tone === "white" ? "rounded-card bg-paper p-7 sm:p-10" : "rounded-card bg-white p-7 sm:p-10"}>
          <Reframe script={statement.script} shift={statement.shift} size="xl" />
        </div>
      </div>
    </Section>
  );
}

function OutcomesSection({ tone, program }: { tone: SectionTone; program: Program }) {
  return (
    <Section tone={tone} aria-labelledby="outcomes-title">
      <SectionHeading eyebrow="Outcomes" title={<span id="outcomes-title">What you&apos;ll walk away with</span>} />
      <ul className="mt-12 grid gap-x-10 gap-y-6 md:grid-cols-2">
        {program.outcomes.map((outcome) => (
          <li key={outcome} className="flex gap-4 border-t border-line pt-6">
            <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-peacock-50 text-peacock-700">
              <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
            </span>
            <span className="text-lg leading-snug text-ink">{outcome}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function AgendaSection({ tone, program }: { tone: SectionTone; program: Program }) {
  const agenda = program.agenda ?? [];
  return (
    <Section tone={tone} aria-labelledby="agenda-title">
      <SectionHeading eyebrow="Agenda" title={<span id="agenda-title">What we&apos;ll cover</span>} />
      <ol className="mt-12 grid gap-6 lg:grid-cols-3">
        {agenda.map((block, i) => {
          const [label, heading] = block.title.includes(" · ")
            ? (block.title.split(" · ", 2) as [string, string])
            : [null, block.title];
          return (
            <li key={block.title} className="flex">
              <Card className={tone === "white" ? "flex w-full flex-col bg-paper p-7" : "flex w-full flex-col p-7"}>
                <div className="flex items-baseline gap-4">
                  <span aria-hidden="true" className="font-display text-4xl leading-none text-marigold-700">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {label ? <span className="eyebrow text-muted">{label}</span> : null}
                </div>
                <h3 className="display-sm mt-5">{heading}</h3>
                <ul className="mt-5 flex flex-col gap-2.5 text-[0.9875rem] text-ink">
                  {block.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span aria-hidden="true" className="mt-[0.6em] h-px w-3 shrink-0 bg-marigold-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}

function FitSection({ tone, program }: { tone: SectionTone; program: Program }) {
  const cardTone = tone === "white" ? "bg-paper" : "bg-white";
  return (
    <Section tone={tone} aria-labelledby="fit-title">
      <SectionHeading eyebrow="Is it a fit?" title={<span id="fit-title">Who this is for</span>} />
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {program.forYou?.length ? (
          <Card className={`p-7 sm:p-8 ${cardTone}`}>
            <h3 className="display-sm">This is for you if</h3>
            <ul className="mt-6 flex flex-col gap-4">
              {program.forYou.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-peacock-600" strokeWidth={2.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
        {program.notForYou?.length ? (
          <Card className={`p-7 sm:p-8 ${cardTone}`}>
            <h3 className="display-sm">It&apos;s not for you if</h3>
            <ul className="mt-6 flex flex-col gap-4">
              {program.notForYou.map((item) => (
                <li key={item} className="flex gap-3 text-muted">
                  <Minus aria-hidden="true" className="mt-1 size-5 shrink-0" strokeWidth={2.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </Section>
  );
}

function GuaranteeSection({ tone, program }: { tone: SectionTone; program: Program }) {
  const label = formatValue(program, "Guarantee");
  return (
    <Section tone={tone} aria-labelledby="guarantee-title">
      <Card className={tone === "white" ? "mx-auto max-w-3xl bg-paper p-7 sm:p-10" : "mx-auto max-w-3xl p-7 sm:p-10"}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-peacock-50 text-peacock-700">
            <ShieldCheck aria-hidden="true" className="size-7" />
          </span>
          <div>
            <p className="eyebrow text-marigold-700">Our guarantee</p>
            <h2 id="guarantee-title" className="display-md mt-3">
              {label ? `${label.charAt(0).toUpperCase()}${label.slice(1)} guarantee` : "Attend, and judge for yourself"}
            </h2>
            <p className="mt-4 text-ink">{program.guarantee}</p>
          </div>
        </div>
      </Card>
    </Section>
  );
}

function FaqSection({ tone, program }: { tone: SectionTone; program: Program }) {
  return (
    <Section tone={tone} aria-labelledby="faq-title">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow="Questions" title={<span id="faq-title">Before you decide</span>} />
          <p className="mt-6 text-muted">
            Something else on your mind?{" "}
            <a
              href={whatsappLink(questionMessage(program))}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900"
            >
              Ask us on WhatsApp
            </a>
            .
          </p>
        </div>
        <FaqList faqs={program.faqs} />
      </div>
    </Section>
  );
}

function EnrollSection({ program, open }: { program: Program; open: boolean }) {
  const { event } = program;
  const headings = enrollHeadings(program);
  const when = eventWhen(program);

  return (
    <Section tone="mist" id="enroll" aria-labelledby="enroll-title">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <div>
          <p className="eyebrow text-marigold-700">{program.shortTitle}</p>
          <h2 id="enroll-title" className="display-lg mt-4">
            {event ? (
              <EventAwareText startsAt={event.startsAt} serverGuess={open} open={headings.open} closed={headings.closed} />
            ) : (
              headings.open
            )}
          </h2>
          {event && when ? (
            <p className="lede mt-5 text-muted">
              {when}, live on {event.platform}, in {event.language}.
            </p>
          ) : (
            <p className="lede mt-5 text-muted">
              Tell us a little about where you are. Manisha&apos;s team will reach out to book your free clarity call, where
              you&apos;ll decide together whether this is the right fit.
            </p>
          )}
          <p className="mt-8 text-muted">
            Questions first?{" "}
            <a
              href={whatsappLink(questionMessage(program))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 hover:decoration-jamun-900"
            >
              <WhatsAppIcon className="size-4 text-peacock-600" />
              Message us on WhatsApp
            </a>
          </p>
        </div>
        <Card className="p-6 sm:p-8">
          <EnrollForm program={program} source="program-page" idPrefix="enroll" tone="light" />
        </Card>
      </div>
    </Section>
  );
}
