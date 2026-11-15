import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check, Compass, HeartHandshake, Mail, MessagesSquare, Mountain, Phone } from "lucide-react";
import { getProgram } from "@/content/programs";
import { credentials, site, whatsappLink } from "@/content/site";
import { testimonials } from "@/content/testimonials";
import { Beam } from "@/components/contact/FormMotion";
import { EngagementSteps } from "@/components/corporate/EngagementSteps";
import { EnquiryForm } from "@/components/corporate/EnquiryForm";
import { TickedNumber } from "@/components/corporate/TickedNumber";
import { AnimatedHeadline } from "@/components/funnel/AnimatedHeadline";
import { Highlighter } from "@/components/kit/highlighter";
import { MagicCard } from "@/components/kit/magic-card";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerList, StaggerListItem } from "@/components/motion/Stagger";
import { FaqList } from "@/components/shared/FaqList";
import { joinList } from "@/components/programs/program-helpers";
import { JsonLd } from "@/components/shared/JsonLd";
import { TestimonialCard } from "@/components/shared/TestimonialCard";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Card, Section, SectionHeading } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";
import { breadcrumbJsonLd, faqJsonLd, pageMetadata } from "@/lib/seo";

const CORPORATE_SLUG = "corporate-training";

export const metadata: Metadata = pageMetadata({
  title: "Corporate training",
  description:
    "Leadership, resilience, emotional intelligence and communication training for teams, managers and women's networks, from a coach with 20+ years of global corporate leadership.",
  path: "/corporate",
});

/** What sessions can focus on. Each description draws on material Manisha already teaches. */
const topics = [
  {
    title: "Leadership",
    icon: Compass,
    body: "Decision-making under uncertainty, calm authority under pressure, and the executive presence that gets people taken seriously.",
  },
  {
    title: "Resilience",
    icon: Mountain,
    body: "Staying composed when the pressure is on, and breaking the perfection and what-if loops that stall action.",
  },
  {
    title: "Emotional intelligence",
    icon: HeartHandshake,
    body: "Responding instead of reacting, handling your own emotions in high-pressure moments, and reading the room with empathy.",
  },
  {
    title: "Communication",
    icon: MessagesSquare,
    body: "Speaking with confidence in meetings, and saying what you think and feel clearly, without conflict.",
  },
];

/** What Power*N covered, taken only from Mayukhi Sen's account of the session. */
const powerNThemes = [
  "The YES and NO battle in the mind, and how often negativity is allowed to win it",
  "Why perfection is so often the enemy of progress",
  "Role-play that participants could see themselves in",
  "Emotions at work: parking them all day, venting them on soft targets later, and why it's okay to be human",
  "Recognising opportunity when it comes knocking",
  "Networking with people who bring positivity and value",
];

const engagementSteps = [
  {
    title: "Briefing call",
    body: "A conversation to understand your people, your goals and the context they work in.",
  },
  {
    title: "Tailored proposal",
    body: "A proposal shaped around what you need: topics, format, length and investment.",
  },
  {
    title: "Delivery",
    body: "Sessions in person or virtual, for a single team or a larger cohort.",
  },
  {
    title: "Follow-up",
    body: "A look back at how it landed, and what support would help your people next.",
  },
];

export default function CorporatePage() {
  const corporate = getProgram(CORPORATE_SLUG);
  if (!corporate) notFound();

  const mayukhi = testimonials.find((t) => t.id === "mayukhi-sen");
  const whatsappHref = whatsappLink("Hi Manisha, I'd like to discuss corporate training for my team.");

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Corporate training", path: "/corporate" },
          ]),
          faqJsonLd(corporate.faqs),
        ]}
      />

      {/* Hero */}
      <Section tone="paper" className="pt-12 pb-16 md:pt-20 md:pb-24" aria-labelledby="corporate-title">
        <div className="max-w-4xl">
          <p className="eyebrow text-marigold-700">{corporate.audience}</p>
          <AnimatedHeadline id="corporate-title" className="display-xl mt-4">
            Leadership training, taught from two decades inside global corporations
          </AnimatedHeadline>
          <Reveal delay={0.4}>
            <p className="lede mt-6 max-w-3xl text-ink">{corporate.promise}</p>
            <p className="mt-4 max-w-3xl text-muted">{corporate.summary}</p>
          </Reveal>
          <Reveal delay={0.55} className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="#enquiry" size="lg" arrow>
              Plan a session for your team
            </ButtonLink>
            <ButtonLink href={whatsappHref} size="lg" variant="outline" icon={<WhatsAppIcon className="text-peacock-600" />}>
              Message us on WhatsApp
            </ButtonLink>
          </Reveal>
        </div>
      </Section>

      {/* Why Manisha */}
      <Section tone="white" aria-labelledby="why-title">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
          <div className="flex flex-col gap-5">
            {site.media.portrait ? (
              <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-card bg-mist">
                <Image
                  src={site.media.portrait}
                  alt={site.coach}
                  fill
                  sizes="(min-width: 1024px) 24rem, 90vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <Reveal from="left" className="rounded-card bg-jamun-900 p-8 text-jamun-100 sm:p-10">
              <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <dt className="sr-only">Corporate leadership</dt>
                  <dd>
                    <TickedNumber
                      value={credentials.corporateYears}
                      className="block font-display text-6xl leading-none text-marigold-300"
                    />
                    <span className="mt-3 block text-[0.9875rem]">years of corporate leadership</span>
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Coaching</dt>
                  <dd>
                    <TickedNumber
                      value={credentials.coachingYears}
                      delay={0.15}
                      className="block font-display text-6xl leading-none text-marigold-300"
                    />
                    <span className="mt-3 block text-[0.9875rem]">years of coaching</span>
                  </dd>
                </div>
              </dl>
              <p className="mt-8 border-t border-white/15 pt-6 text-[0.9375rem] text-jamun-200">
                Led across {joinList(credentials.countries)}
              </p>
            </Reveal>
          </div>

          <div>
            <Reveal>
              <SectionHeading
                eyebrow="Why Manisha"
                title={<span id="why-title">She has sat where your managers sit</span>}
                intro="Manisha teaches leadership from lived experience, not theory."
              />
            </Reveal>
            <StaggerList className="mt-10 flex flex-col divide-y divide-line border-y border-line">
              {[
                `${credentials.corporateYears} years of corporate leadership across ${joinList(credentials.countries)}`,
                credentials.education,
                credentials.formerRole,
                `${credentials.coachingYears} years of coaching`,
              ].map((fact) => (
                <StaggerListItem key={fact} className="flex gap-4 py-4">
                  <Check aria-hidden="true" className="mt-1 size-5 shrink-0 text-peacock-600" strokeWidth={2.5} />
                  <span className="text-lg leading-snug text-ink">{fact}</span>
                </StaggerListItem>
              ))}
            </StaggerList>
          </div>
        </div>
      </Section>

      {/* Topics */}
      <Section tone="paper" aria-labelledby="topics-title">
        <Reveal>
          <SectionHeading
            eyebrow="Topics"
            title={<span id="topics-title">What sessions can focus on</span>}
            intro="Every engagement is tailored after a briefing call, drawing on four core areas."
          />
        </Reveal>
        <StaggerList className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map(({ title, icon: Icon, body }) => (
            <StaggerListItem key={title} className="rounded-card">
              <MagicCard
                gradientSize={260}
                gradientFrom="var(--color-marigold-400)"
                gradientTo="var(--color-peacock-600)"
                gradientColor="var(--color-marigold-200)"
                gradientOpacity={0.5}
                className="h-full rounded-card transition-transform duration-300 ease-shift hover:-translate-y-1 motion-reduce:hover:translate-y-0"
              >
                <div className="p-7">
                  <span className="inline-flex size-12 items-center justify-center rounded-full bg-mist text-jamun-900 transition-colors duration-300 group-hover:bg-marigold-200">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <h3 className="display-sm mt-6">{title}</h3>
                  <p className="mt-3 text-[0.9875rem] text-muted">{body}</p>
                </div>
              </MagicCard>
            </StaggerListItem>
          ))}
        </StaggerList>
      </Section>

      {/* Power*N */}
      <Section tone="jamun" aria-labelledby="powern-title">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <p className="eyebrow text-marigold-300">Power*N</p>
            <h2 id="powern-title" className="display-lg mt-4">
              An{" "}
              <Highlighter action="underline" color="#f2a93b" strokeWidth={2.5} padding={1} animationDuration={900} isView>
                inner-power
              </Highlighter>{" "}
              session for women in engineering
            </h2>
            <p className="lede mt-6 text-jamun-100">
              Power*N was led by Manisha, then Aptiv&apos;s in-house agile coach, for the Aptiv Technical Center India DEI
              Council for women in engineering. As one participant described it, the session explored:
            </p>
            <StaggerList stagger={0.07} className="mt-8 flex flex-col gap-4">
              {powerNThemes.map((theme) => (
                <StaggerListItem key={theme} className="flex gap-3">
                  <span aria-hidden="true" className="mt-[0.7em] h-px w-4 shrink-0 bg-marigold-400" />
                  <span className="text-jamun-100">{theme}</span>
                </StaggerListItem>
              ))}
            </StaggerList>
            <Reframe
              tone="dark"
              size="lg"
              script="I'll speak up once it's perfect."
              shift="Progress over perfection."
              className="mt-12 border-t border-white/15 pt-10"
            />
          </div>
          <Reveal from="right" delay={0.1} className="flex flex-col gap-6 lg:self-start lg:pt-2">
            {mayukhi ? <TestimonialCard testimonial={mayukhi} tone="dark" /> : null}
            <p className="text-[0.9375rem] text-jamun-200">
              Want something similar for your women&apos;s network or DEI council? Mention Power*N in your enquiry.
            </p>
          </Reveal>
        </div>
      </Section>

      {/* Formats and outcomes */}
      <Section tone="white" aria-labelledby="formats-title">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <SectionHeading eyebrow="Formats" title={<span id="formats-title">Shaped to fit your organisation</span>} />
            </Reveal>
            <Reveal delay={0.1}>
              <dl className="mt-10 grid gap-4 sm:grid-cols-2">
                {corporate.format.map((f) => (
                  <div key={f.label} className="rounded-card border border-line bg-paper p-6">
                    <dt className="eyebrow text-marigold-700">{f.label}</dt>
                    <dd className="mt-3 text-lg leading-snug font-semibold text-jamun-900">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
          <div>
            <Reveal>
              <h3 className="display-md lg:mt-[4.25rem]">What your people leave with</h3>
            </Reveal>
            <StaggerList className="mt-8 flex flex-col gap-5">
              {corporate.outcomes.map((outcome) => (
                <StaggerListItem key={outcome} className="flex gap-4">
                  <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-peacock-50 text-peacock-700">
                    <Check aria-hidden="true" className="size-4" strokeWidth={2.5} />
                  </span>
                  <span className="text-lg leading-snug text-ink">{outcome}</span>
                </StaggerListItem>
              ))}
            </StaggerList>
          </div>
        </div>
      </Section>

      {/* How an engagement works */}
      <Section tone="paper" aria-labelledby="process-title">
        <Reveal>
          <SectionHeading eyebrow="How it works" title={<span id="process-title">From first call to follow-up</span>} />
        </Reveal>
        <EngagementSteps steps={engagementSteps} />
      </Section>

      {/* Enquiry */}
      <Section tone="mist" id="enquiry" aria-labelledby="enquiry-title">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
          <Reveal>
            <SectionHeading
              eyebrow="Enquire"
              title={<span id="enquiry-title">Tell us about your team</span>}
              intro="Share a few details and Manisha's team will get back to you to set up a briefing call."
            />
            <div className="mt-8 flex flex-col gap-1 text-[0.9875rem]">
              <p className="font-semibold text-jamun-900">Prefer email or phone?</p>
              <a
                href={`mailto:${site.contact.email}`}
                className="inline-flex min-h-11 items-center gap-2 text-ink underline-offset-4 hover:text-jamun-900 hover:underline"
              >
                <Mail aria-hidden="true" className="size-4 text-muted" />
                {site.contact.email}
              </a>
              <a
                href={`tel:${site.contact.phoneE164}`}
                className="inline-flex min-h-11 items-center gap-2 text-ink underline-offset-4 hover:text-jamun-900 hover:underline"
              >
                <Phone aria-hidden="true" className="size-4 text-muted" />
                {site.contact.phoneDisplay}
              </a>
              <p className="text-muted">{site.contact.hours}</p>
            </div>
            {corporate.faqs.length ? (
              <div className="mt-12">
                <h3 className="display-sm">Common questions</h3>
                <FaqList faqs={corporate.faqs} className="mt-4" />
              </div>
            ) : null}
          </Reveal>
          <Reveal delay={0.1}>
            <Card className="relative p-6 sm:p-8">
              <EnquiryForm />
              <Beam />
            </Card>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
