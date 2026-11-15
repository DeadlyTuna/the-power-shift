import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Compass, HeartHandshake, Mic, ShieldCheck } from "lucide-react";
import { getProgram, isEventOpen } from "@/content/programs";
import { credentials, site } from "@/content/site";
import { testimonials } from "@/content/testimonials";
import { AnimatedHeadline } from "@/components/funnel/AnimatedHeadline";
import { CheckList } from "@/components/funnel/CheckList";
import { ClosingCta } from "@/components/funnel/ClosingCta";
import { CoachPortrait } from "@/components/funnel/CoachPortrait";
import { EventFacts } from "@/components/funnel/EventFacts";
import { EventStatusProvider, EventSwitch } from "@/components/funnel/EventStatus";
import { FitColumns } from "@/components/funnel/FitColumns";
import { FunnelFaq } from "@/components/funnel/FunnelFaq";
import { FunnelHero } from "@/components/funnel/FunnelHero";
import { RegisterCard } from "@/components/funnel/RegisterCard";
import { RoleMarquee } from "@/components/funnel/RoleMarquee";
import { RollingCountdown } from "@/components/funnel/RollingCountdown";
import { RegisterCta } from "@/components/funnel/RegisterCta";
import { StickyRegisterBar } from "@/components/funnel/StickyRegisterBar";
import { TestimonialGrid } from "@/components/funnel/TestimonialGrid";
import { WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { JsonLd } from "@/components/shared/JsonLd";
import { Card, Section, SectionHeading } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";
import { formatDuration, formatEventDate, formatEventTime, formatINR } from "@/lib/format";
import { eventJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

/** Re-render at most every 5 minutes so the open / waitlist state never freezes at build time. */
export const revalidate = 300;

const SLUG = "leadership-confidence-workshop";
const PATH = "/leadership-workshop";
const SOURCE = "leadership-workshop";

const CLOSED_LABEL = "Join the waitlist";
const WHATSAPP_MESSAGE = "Hi Manisha, I have a question about the live leadership workshop.";
const CLOSING_ID = "closing";

const TITLE = "Live leadership workshop for working professionals";
const DESCRIPTION =
  "A live, practical 3-hour workshop with Manisha Agrawal for corporate professionals ready to lead: stop second-guessing decisions, speak with confidence in meetings and break procrastination loops.";
const OG_TITLE = "Build confidence like a leader in one live 3-hour workshop";
const OG_DESCRIPTION =
  "Stop second-guessing decisions and speak with confidence in meetings. A live, practical workshop with Manisha Agrawal, 20+ years in global corporate leadership. 100% money-back guarantee.";

/** The shared helper keeps the site's share image; only the ad-facing title and description change. */
const baseMetadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export const metadata: Metadata = {
  ...baseMetadata,
  openGraph: { ...baseMetadata.openGraph, title: OG_TITLE, description: OG_DESCRIPTION },
  twitter: { ...baseMetadata.twitter, title: OG_TITLE, description: OG_DESCRIPTION },
};

const roles = [
  "Managers and assistant managers",
  "Team leaders and project leads",
  "Senior executives and executives",
  "Consultants and analysts",
  "HR, marketing and finance professionals",
  "Engineers and IT professionals",
  "Business development professionals",
];

const pressurePoints = [
  "Speaking up with certainty",
  "Handling pressure conversations",
  "Taking bold decisions",
  "Showing executive presence",
  "Stopping procrastination on the things that matter",
];

const skills = [
  {
    title: "Authority confidence",
    body: "Speak with certainty and carry calm authority in meetings, even under pressure.",
    Icon: Mic,
  },
  {
    title: "High emotional intelligence",
    body: "Respond instead of reacting, and handle the emotions in the room with empathy.",
    Icon: HeartHandshake,
  },
  {
    title: "Decision clarity + action",
    body: "Decide under uncertainty, then follow through without getting stuck in perfection loops.",
    Icon: Compass,
  },
];

/** "Hour 1 · Clarity + …" → { label: "Hour 1", title: "Clarity + …" } */
function splitAgendaTitle(title: string) {
  const [label, ...rest] = title.split(" · ");
  return rest.length ? { label, title: rest.join(" · ") } : { label: null, title };
}

function joinList(items: readonly string[]) {
  return items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}` : (items[0] ?? "");
}

export default function LeadershipWorkshopPage() {
  const program = getProgram(SLUG);
  if (!program?.event || !program.price) notFound();
  const { event, price } = program;

  const serverOpen = isEventOpen(program);
  const eventLd = serverOpen ? eventJsonLd(program) : null;

  const priceLabel = formatINR(price.amount);
  const openLabel = `Reserve my seat for ${priceLabel}`;
  const duration = formatDuration(event.durationMinutes); // "3 hours"
  const hours = event.durationMinutes / 60;
  const durationAdjective = Number.isInteger(hours) ? `${hours}-hour` : duration; // "3-hour"

  return (
    <EventStatusProvider program={program} serverOpen={serverOpen}>
      {eventLd ? <JsonLd data={eventLd} /> : null}
      <JsonLd data={faqJsonLd(program.faqs)} />

      {/* ---------- Hero ---------- */}
      <FunnelHero
        labelledBy="hero-title"
        aside={
          <RegisterCard
            program={program}
            source={`${SOURCE}-hero`}
            idPrefix="lw"
            openTitle="Reserve your seat"
            openIntro={`${formatEventDate(event.startsAt)}, ${formatEventTime(event.startsAt)}. ${priceLabel} for the live ${durationAdjective} workshop.`}
            closedTitle="Join the waitlist"
          />
        }
      >
        <p className="eyebrow text-marigold-700">For working professionals who know they&apos;re meant to lead</p>
        <AnimatedHeadline id="hero-title" className="display-lg mt-4 text-jamun-900 lg:text-[3.5rem]">
          Build confidence like a leader. Think with clarity. Lead with emotional intelligence. Act consistently.
        </AnimatedHeadline>
        <p className="lede mt-6 text-ink">A live, practical {durationAdjective} workshop to help you:</p>
        <CheckList items={program.outcomes} className="mt-4" />

        <div className="mt-8 flex flex-col gap-1.5 rounded-card border border-line bg-white px-5 py-4 sm:flex-row sm:items-center sm:gap-5">
          <p className="font-display text-[2.5rem] leading-none text-jamun-900">{priceLabel}</p>
          <div className="text-[0.9375rem] leading-snug">
            <p className="font-semibold text-jamun-900">
              For the full live workshop, with a 100% money-back guarantee.
            </p>
            {price.anchor ? <p className="mt-0.5 text-muted">{price.anchor}</p> : null}
          </div>
        </div>

        <EventFacts program={program} showDuration showPrice={false} className="mt-8" />
        <EventSwitch open={<RollingCountdown startsAt={event.startsAt} className="mt-6" />} />
      </FunnelHero>

      {/* ---------- Who should attend ---------- */}
      <Section tone="white" aria-labelledby="attend-title">
        <SectionHeading
          eyebrow="Who should attend"
          title={<span id="attend-title">Built for corporate professionals ready to step into leadership</span>}
          intro="Whatever your title today, if you work in a corporate organisation and want to lead, this workshop is designed for you."
        />
        <RoleMarquee roles={roles} className="mt-10" />
      </Section>

      {/* ---------- The real problem ---------- */}
      <Section tone="paper" aria-labelledby="problem-title">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow text-marigold-700">The real problem</p>
            <h2 id="problem-title" className="display-lg mt-4 text-jamun-900">
              You&apos;re good at your job. You&apos;re responsible. You deliver.
            </h2>
            <p className="lede mt-6 text-ink">But when it comes to:</p>
            <ul className="mt-4 flex flex-col">
              {pressurePoints.map((point) => (
                <li key={point} className="border-b border-line py-3 text-lg font-medium text-jamun-900 first:border-t">
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center">
            <p className="lede text-ink">
              …something holds you back. Not because you&apos;re weak, but because your mind is running a{" "}
              <strong className="font-semibold text-jamun-900">silent leadership script</strong>: overthinking,
              perfectionism, fear of judgment, and one question on repeat.
            </p>
            <Card className="mt-8 p-7 sm:p-9">
              <Reframe
                size="xl"
                script="What if I'm wrong?"
                shift="I decide with the clarity I have, and adjust as I learn."
              />
            </Card>
          </div>
        </div>
      </Section>

      {/* ---------- It's no secret ---------- */}
      <Section tone="jamun" aria-labelledby="secret-title">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow text-marigold-300">It&apos;s no secret</p>
          <h2 id="secret-title" className="display-md mt-5 text-white">
            When you develop confidence, decision clarity and emotional intelligence, you gain the power to influence
            conversations, own critical decisions and earn the leadership position your career deserves.
          </h2>
        </div>
      </Section>

      {/* ---------- The promise ---------- */}
      <Section tone="white" aria-labelledby="promise-title">
        <div className="max-w-3xl">
          <p className="eyebrow text-marigold-700">The promise</p>
          <h2 id="promise-title" className="display-lg mt-4 text-jamun-900">
            In {duration}, you&apos;ll build the {skills.length} skills that decide promotions
          </h2>
          <figure className="mt-6">
            <blockquote className="lede text-muted">
              <p>
                &ldquo;I&apos;ll teach you my most powerful mindset and emotional shifts, the ones that turn capable
                professionals into confident leaders, and show you my framework to build unshakeable confidence, gain
                decision clarity, lead with empathy and execute without procrastination.&rdquo;
              </p>
            </blockquote>
            <figcaption className="mt-3 font-semibold text-jamun-900">{site.coach}</figcaption>
          </figure>
        </div>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {skills.map(({ title, body, Icon }) => (
            <li key={title}>
              <Card className="flex h-full flex-col gap-5 p-7">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-mist text-jamun-800">
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                <div>
                  <h3 className="display-sm text-jamun-900">{title}</h3>
                  <p className="mt-2 text-muted">{body}</p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- Agenda (a real sequence) ---------- */}
      {program.agenda?.length ? (
        <Section tone="mist" aria-labelledby="agenda-title">
          <SectionHeading
            eyebrow={`The ${durationAdjective} agenda`}
            title={<span id="agenda-title">What we&apos;ll cover, hour by hour</span>}
          />
          <ol className="mt-12 grid gap-4 lg:grid-cols-3">
            {program.agenda.map((block, i) => {
              const { label, title } = splitAgendaTitle(block.title);
              return (
                <li key={block.title}>
                  <Card className="flex h-full flex-col p-7 sm:p-8">
                    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-5">
                      <span aria-hidden="true" className="font-display text-[2.75rem] leading-none text-marigold-700">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {label ? <span className="eyebrow text-muted">{label}</span> : null}
                    </div>
                    <h3 className="display-sm mt-6 text-jamun-900">
                      {label ? <span className="sr-only">{label}: </span> : null}
                      {title}
                    </h3>
                    <CheckList items={block.points} marker="dot" className="mt-5" />
                  </Card>
                </li>
              );
            })}
          </ol>
          <div className="mt-12">
            <RegisterCta openLabel={openLabel} closedLabel={CLOSED_LABEL} className="w-full sm:w-auto" />
          </div>
        </Section>
      ) : null}

      {/* ---------- About the coach ---------- */}
      <Section tone="white" aria-labelledby="coach-title">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-20">
          <CoachPortrait
            className="order-last lg:sticky lg:top-28 lg:order-first lg:self-start"
            facts={[
              { value: credentials.corporateYears, label: "years in corporate leadership" },
              { value: credentials.coachingYears, label: "years of coaching" },
            ]}
            note={`${credentials.education}. ${credentials.recognition}.`}
          />
          <div>
            <p className="eyebrow text-marigold-700">About your coach</p>
            <h2 id="coach-title" className="display-lg mt-4 text-jamun-900">
              {site.coach}
            </h2>
            <div className="mt-6 flex max-w-2xl flex-col gap-5 text-[1.0625rem] text-ink">
              <p className="lede">
                {site.coach} is a {site.role} with {credentials.corporateYears} years of corporate leadership experience
                across global environments, including {joinList(credentials.countries)}.
              </p>
              <p>
                She has led teams, navigated high-pressure decisions and operated at boardroom level within complex
                corporate structures.
              </p>
              <p>
                After two decades in leadership roles, she moved into coaching, helping working professionals build the
                clarity, confidence and emotional intelligence to step into stronger leadership positions.
              </p>
              <p>
                With {credentials.coachingYears} years of coaching experience and award-winning recognition, she brings a
                rare blend of strategic corporate insight and deep psychological understanding.
              </p>
              <p>
                She doesn&apos;t teach leadership from theory. She teaches it from lived experience: practical, precise
                and rooted in real corporate reality.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- In their words ---------- */}
      <Section tone="paper" aria-labelledby="words-title">
        <SectionHeading
          eyebrow="In their words"
          title={<span id="words-title">What professionals say about working with Manisha</span>}
        />
        <TestimonialGrid items={testimonials} className="mt-12" />
      </Section>

      {/* ---------- Who it's for / not for ---------- */}
      <Section tone="white" aria-labelledby="fit-title">
        <SectionHeading eyebrow="Before you register" title={<span id="fit-title">Is this workshop for you?</span>} />
        <FitColumns forYou={program.forYou ?? []} notForYou={program.notForYou ?? []} className="mt-12" />
      </Section>

      {/* ---------- Guarantee ---------- */}
      {program.guarantee ? (
        <Section tone="mist" aria-labelledby="guarantee-title">
          <Card className="mx-auto max-w-4xl p-7 sm:p-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
              <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-peacock-50 text-peacock-700">
                <ShieldCheck aria-hidden="true" className="size-7" />
              </span>
              <div>
                <p className="eyebrow text-marigold-700">Our guarantee</p>
                <h2 id="guarantee-title" className="display-md mt-3 text-jamun-900">
                  100% satisfaction, money-back guarantee
                </h2>
                <div className="mt-6 flex flex-col gap-4 text-ink">
                  <p className="lede">
                    I want you to feel confident that this is the right decision for your career growth.
                  </p>
                  <p>{program.guarantee}</p>
                  <p>
                    This is about your leadership clarity, your executive presence and your next level. You deserve to
                    invest in your growth without risk.
                  </p>
                  <p className="font-semibold text-jamun-900">{site.coach}</p>
                </div>
              </div>
            </div>
          </Card>
        </Section>
      ) : null}

      {/* ---------- Investment ---------- */}
      <Section tone="paper" aria-labelledby="investment-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-center lg:gap-20">
          <div>
            <p className="eyebrow text-marigold-700">Your investment</p>
            <h2 id="investment-title" className="display-lg mt-4 text-jamun-900">
              What&apos;s your investment?
            </h2>
            {price.anchor ? <p className="lede mt-6 text-muted">{price.anchor}</p> : null}
            <p className="lede mt-4 text-ink">
              This live {durationAdjective} workshop is priced at {priceLabel}, and it&apos;s covered by the money-back
              guarantee.
            </p>
          </div>
          <Card className="p-7 sm:p-9">
            <p className="eyebrow text-muted">Live {durationAdjective} workshop</p>
            <p className="mt-4 font-display text-[4.5rem] leading-none text-jamun-900">{priceLabel}</p>
            <p className="mt-2 text-[0.9375rem] text-muted">One-time payment.</p>
            <dl className="mt-7 flex flex-col border-t border-line">
              {program.format.map((item) => (
                <div key={item.label} className="flex justify-between gap-4 border-b border-line py-3 text-[0.9875rem]">
                  <dt className="text-muted">{item.label}</dt>
                  <dd className="text-right font-semibold text-jamun-900">{item.value}</dd>
                </div>
              ))}
            </dl>
            <RegisterCta openLabel={openLabel} closedLabel={CLOSED_LABEL} className="mt-8 w-full" />
          </Card>
        </div>
      </Section>

      {/* ---------- FAQ ---------- */}
      <Section tone="white" aria-labelledby="faq-title">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Questions" title={<span id="faq-title">Questions, answered</span>} />
            <p className="mt-5 text-muted">Still unsure? Ask on WhatsApp ({site.contact.hours}).</p>
            <WhatsAppLink message={WHATSAPP_MESSAGE} source={`${SOURCE}-faq`} className="mt-5">
              Ask on WhatsApp
            </WhatsAppLink>
          </div>
          <FunnelFaq faqs={program.faqs} />
        </div>
      </Section>

      {/* ---------- Closing ---------- */}
      <ClosingCta
        id={CLOSING_ID}
        title="Leadership isn't about being louder. It's about being unshakably clear."
        openBody={`Spend ${duration} live with ${site.coach.split(" ")[0]} and leave with practical tools for your next meeting, your next decision and your next high-pressure conversation. ${priceLabel}, with a full money-back guarantee.`}
        closedBody="The next workshop date is being set. Join the waitlist and you'll be the first to hear when registration opens."
        openLabel={openLabel}
        closedLabel={CLOSED_LABEL}
        whatsappMessage={WHATSAPP_MESSAGE}
        source={`${SOURCE}-closing`}
        notes={[`Live on ${event.platform}`, event.language, duration, "100% money-back guarantee"]}
      />

      <StickyRegisterBar
        openLabel={openLabel}
        closedLabel={CLOSED_LABEL}
        whatsappMessage={WHATSAPP_MESSAGE}
        source={`${SOURCE}-sticky-bar`}
        endId={CLOSING_ID}
      />
    </EventStatusProvider>
  );
}
