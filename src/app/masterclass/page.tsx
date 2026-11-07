import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check, MessagesSquare } from "lucide-react";
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
import { RollingCountdown } from "@/components/funnel/RollingCountdown";
import { RegisterCta } from "@/components/funnel/RegisterCta";
import { SeatNote } from "@/components/funnel/SeatNote";
import { StickyRegisterBar } from "@/components/funnel/StickyRegisterBar";
import { TestimonialGrid } from "@/components/funnel/TestimonialGrid";
import { WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { JsonLd } from "@/components/shared/JsonLd";
import { Card, Section, SectionHeading } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";
import { formatEventDate, formatEventTime } from "@/lib/format";
import { eventJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

/** Re-render at most every 5 minutes so the open / waitlist state never freezes at build time. */
export const revalidate = 300;

const SLUG = "be-heard-masterclass";
const PATH = "/masterclass";
const SOURCE = "masterclass";

const OPEN_LABEL = "Reserve my free seat";
const CLOSED_LABEL = "Join the waitlist";
const WHATSAPP_MESSAGE = "Hi Manisha, I have a question about the free Be Heard masterclass for working women.";
const CLOSING_ID = "closing";

const TITLE = "Free live masterclass for working women";
const DESCRIPTION =
  "Feel unheard at home or at work? Learn to express what you feel clearly, stop replaying conversations, and feel respected, without fighting or guilt. A free live masterclass with Manisha Agrawal.";
const OG_TITLE = "Be heard, understood and emotionally respected";
const OG_DESCRIPTION =
  "A free live masterclass for working women: express what you feel without fighting, shouting or feeling guilty. Live on Zoom, in Hindi and English, with Manisha Agrawal.";

/** The shared helper keeps the site's share image; only the ad-facing title and description change. */
const baseMetadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: PATH });

export const metadata: Metadata = {
  ...baseMetadata,
  openGraph: { ...baseMetadata.openGraph, title: OG_TITLE, description: OG_DESCRIPTION },
  twitter: { ...baseMetadata.twitter, title: OG_TITLE, description: OG_DESCRIPTION },
};

const familiar = [
  "You feel unheard in your relationships",
  "You're emotionally exhausted every day",
  "You feel taken for granted at home",
];

const reality = [
  { title: "You feel unheard", body: "Even when you speak, it seems no one really listens." },
  { title: "You feel unappreciated", body: "All that effort, and nobody seems to notice." },
  { title: "You feel emotionally drained", body: "Giving and giving, with nothing coming back." },
];

const questions = [
  "Why doesn't anyone really understand me?",
  "Why do I always have to be the one who adjusts?",
  "Why do simple conversations become so heavy?",
];

const instead = ["Staying quiet", "Suppressing your feelings", "Overthinking everything later"];

const neverTaught = [
  "Express your feelings without being misunderstood",
  "Communicate clearly without an emotional breakdown",
  "Be heard and respected without creating conflict",
];

const afterSession = [
  "Feel emotionally lighter, as if a weight has been lifted",
  "Stop replaying conversations in your head at night",
  "Communicate calmly and clearly with the people you love",
  "Feel more valued and respected in your relationships",
];

const coachHelps = [
  "Helps working women understand their emotional patterns",
  "Guides women to stop feeling unheard in their relationships",
  "Builds frameworks for peaceful, respectful connections",
];

export default function MasterclassPage() {
  const program = getProgram(SLUG);
  if (!program?.event) notFound();
  const { event } = program;
  const serverOpen = isEventOpen(program);
  const eventLd = serverOpen ? eventJsonLd(program) : null;
  const qna = program.format.find((f) => f.label === "Includes")?.value ?? "Live Q&A";

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
            idPrefix="mc"
            openTitle="Reserve your free seat"
            openIntro={`${formatEventDate(event.startsAt)}, ${formatEventTime(event.startsAt)}. Live on ${event.platform}.`}
            closedTitle="Join the waitlist"
            openFootnote={<SeatNote program={program} />}
          />
        }
      >
        <p className="eyebrow text-marigold-700">{program.audience} · Free live masterclass</p>
        <AnimatedHeadline id="hero-title" className="display-xl mt-4 text-jamun-900 lg:text-[4.25rem]">
          Learn how to be heard, understood and emotionally respected
        </AnimatedHeadline>
        <p className="lede mt-6 max-w-xl text-ink">{program.promise}</p>

        <div className="mt-8">
          <p className="font-semibold text-jamun-900">Does this sound familiar?</p>
          <CheckList items={familiar} marker="dot" className="mt-3 gap-2.5" />
        </div>

        <EventFacts program={program} className="mt-9" />
        <EventSwitch
          open={<RollingCountdown startsAt={event.startsAt} className="mt-6" />}
        />
      </FunnelHero>

      {/* ---------- The reality ---------- */}
      <Section tone="white" aria-labelledby="reality-title">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div>
            <p className="eyebrow text-marigold-700">The reality</p>
            <h2 id="reality-title" className="display-lg mt-4 text-jamun-900">
              You&apos;re doing everything, but still don&apos;t feel understood
            </h2>
            <p className="lede mt-6 text-muted">
              You manage work. You take care of your family. You try to keep everyone happy. But inside, something feels
              deeply wrong.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {reality.map((item) => (
              <Card key={item.title} className="bg-paper p-6 sm:p-7">
                <h3 className="display-sm text-jamun-900">{item.title}</h3>
                <p className="mt-2 text-muted">{item.body}</p>
              </Card>
            ))}
            <p className="mt-4 text-lg text-ink">
              <strong className="font-semibold text-jamun-900">And the hardest part?</strong> You can&apos;t even express
              it properly without it turning into stress, guilt or complete silence.
            </p>
          </div>
        </div>
      </Section>

      {/* ---------- The deeper pain ---------- */}
      <Section tone="mist" aria-labelledby="pain-title">
        <SectionHeading
          eyebrow="The deeper pain"
          title={<span id="pain-title">It&apos;s not that you don&apos;t love them. But you often wonder:</span>}
        />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {questions.map((q) => (
            <li key={q} className="border-l-2 border-marigold-400 pl-5">
              <p className="display-sm text-jamun-900">{q}</p>
            </li>
          ))}
        </ul>
        <div className="mt-14 grid gap-6 border-t border-jamun-200 pt-10 md:grid-cols-[auto_1fr] md:items-center md:gap-10">
          <p className="text-lg font-semibold text-jamun-900">So you start doing this instead:</p>
          <ul className="flex flex-wrap gap-2.5">
            {instead.map((habit) => (
              <li key={habit} className="rounded-full border border-jamun-200 bg-white px-4 py-2 font-medium text-jamun-900">
                {habit}
              </li>
            ))}
          </ul>
        </div>
        <p className="lede mt-8 text-muted">And slowly, your relationships start to feel distant.</p>
      </Section>

      {/* ---------- The truth (the turn) ---------- */}
      <Section tone="jamun" aria-labelledby="truth-title">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p className="eyebrow text-marigold-300">The truth</p>
            <h2 id="truth-title" className="display-lg mt-4">
              The problem isn&apos;t your family. It&apos;s how your emotions are being expressed.
            </h2>
            <p className="lede mt-6 text-jamun-100">Because no one ever taught you how to:</p>
            <CheckList items={neverTaught} tone="dark" marker="dot" className="mt-5" />
          </div>
          <div className="rounded-card border border-white/15 p-7 sm:p-10">
            <Reframe
              tone="dark"
              size="xl"
              script="I'll stay quiet to keep the peace."
              shift="I can speak up and still keep the peace."
            />
            <RegisterCta openLabel={OPEN_LABEL} closedLabel={CLOSED_LABEL} className="mt-10 w-full sm:w-auto" />
          </div>
        </div>
      </Section>

      {/* ---------- What you'll learn ---------- */}
      <Section tone="paper" aria-labelledby="learn-title">
        <SectionHeading
          eyebrow="Inside the masterclass"
          title={<span id="learn-title">What you&apos;ll actually learn</span>}
          intro="Practical tools you can use from day one, even if you've never worked on your emotions before."
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {program.outcomes.map((outcome) => (
            <li key={outcome}>
              <Card className="flex h-full items-start gap-4 p-5 sm:flex-col sm:p-7">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-peacock-50 text-peacock-700">
                  <Check aria-hidden="true" className="size-5" strokeWidth={2.5} />
                </span>
                <p className="text-lg leading-snug font-semibold text-jamun-900">{outcome}</p>
              </Card>
            </li>
          ))}
          <li>
            <div data-tone="jamun" className="flex h-full items-start gap-4 rounded-card bg-jamun-900 p-5 sm:flex-col sm:p-7">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-marigold-400 text-jamun-950">
                <MessagesSquare aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="text-lg leading-snug font-semibold text-white">{qna}</p>
                <p className="mt-2 text-jamun-100">
                  Ask your personal questions and get real, thoughtful answers, not generic advice.
                </p>
              </div>
            </div>
          </li>
        </ul>
        <div className="mt-12">
          <RegisterCta openLabel={OPEN_LABEL} closedLabel={CLOSED_LABEL} className="w-full sm:w-auto" />
        </div>
      </Section>

      {/* ---------- After this session ---------- */}
      <Section tone="white" aria-labelledby="after-title">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <SectionHeading
            eyebrow="After this session"
            title={<span id="after-title">Walk away lighter, calmer and clearer</span>}
          />
          <CheckList items={afterSession} size="lg" className="lg:pt-10" />
        </div>
      </Section>

      {/* ---------- Meet your coach ---------- */}
      <Section tone="mist" aria-labelledby="coach-title">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,26rem)_1fr] lg:items-center lg:gap-20">
          <CoachPortrait
            className="order-last lg:order-first"
            facts={[
              { value: credentials.coachingYears, label: "years of coaching" },
              { value: credentials.corporateYears, label: "years in corporate leadership" },
            ]}
          />
          <div>
            <p className="eyebrow text-marigold-700">Meet your coach</p>
            <h2 id="coach-title" className="display-lg mt-4 text-jamun-900">
              {site.coach}
            </h2>
            <p className="mt-2 text-xl font-semibold text-marigold-700">Designing beautiful relationships</p>
            <p className="lede mt-6 text-ink">
              I&apos;ve spent years understanding what holds women back from being truly heard, and it&apos;s almost
              never about not trying hard enough. It&apos;s about emotional patterns that were never taught to us.
            </p>
            <CheckList items={coachHelps} className="mt-8" />
            <blockquote className="mt-10 border-l-2 border-marigold-400 pl-6">
              <p className="display-sm text-jamun-900">
                So they can feel calm, valued, and emotionally strong — without losing themselves.
              </p>
            </blockquote>
          </div>
        </div>
      </Section>

      {/* ---------- In their words ---------- */}
      <Section tone="white" aria-labelledby="words-title">
        <SectionHeading
          eyebrow="In their words"
          title={<span id="words-title">What clients say about working with Manisha</span>}
        />
        <TestimonialGrid items={testimonials} className="mt-12" />
      </Section>

      {/* ---------- Is this for you ---------- */}
      <Section tone="paper" aria-labelledby="fit-title">
        <SectionHeading eyebrow="Before you register" title={<span id="fit-title">Is this for you?</span>} />
        <FitColumns forYou={program.forYou ?? []} notForYou={program.notForYou ?? []} className="mt-12" />
        <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
          <RegisterCta openLabel={OPEN_LABEL} closedLabel={CLOSED_LABEL} className="w-full sm:w-auto" />
          <EventSwitch open={<SeatNote program={program} className="text-muted" />} />
        </div>
      </Section>

      {/* ---------- FAQ ---------- */}
      <Section tone="white" aria-labelledby="faq-title">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div>
            <SectionHeading eyebrow="Questions" title={<span id="faq-title">Questions, answered</span>} />
            <p className="mt-5 text-muted">
              Still unsure? Ask on WhatsApp ({site.contact.hours}).
            </p>
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
        title="You've adjusted enough. Now it's time to be understood."
        openBody="One session. Real tools. A life where you feel heard, valued and emotionally respected, without fighting or feeling guilty. The masterclass is completely free."
        closedBody="The next masterclass date is being set. Join the waitlist and you'll be the first to hear when registration opens."
        openLabel={OPEN_LABEL}
        closedLabel={CLOSED_LABEL}
        whatsappMessage={WHATSAPP_MESSAGE}
        source={`${SOURCE}-closing`}
        notes={["Free", "Live on " + event.platform, event.language, program.audience]}
      />

      <StickyRegisterBar
        openLabel={OPEN_LABEL}
        closedLabel={CLOSED_LABEL}
        whatsappMessage={WHATSAPP_MESSAGE}
        source={`${SOURCE}-sticky-bar`}
        endId={CLOSING_ID}
      />
    </EventStatusProvider>
  );
}
