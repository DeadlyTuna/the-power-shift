import type { Metadata } from "next";
import { statements } from "@/content/assessment";
import { site, whatsappLink } from "@/content/site";
import { BookingEmbed } from "@/components/booking/BookingEmbed";
import { BookingForm } from "@/components/booking/BookingForm";
import { Beam } from "@/components/contact/FormMotion";
import { AnimatedHeadline } from "@/components/funnel/AnimatedHeadline";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerOl, StaggerOlItem } from "@/components/funnel/StaggerOl";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { JsonLd } from "@/components/shared/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Card, Section } from "@/components/ui/Layout";
import { Reframe } from "@/components/ui/Reframe";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Book a free clarity call",
  description:
    "Talk to Manisha Agrawal about your goals and what's in the way, and get a recommendation for the right starting point. Free.",
  path: "/book",
});

const callSteps = [
  {
    title: "Understand your goals",
    body: "What you want for your career, your relationships or your team, and why it matters now.",
  },
  {
    title: "Look at what's in the way",
    body: "The patterns, situations and habits that keep pulling you back.",
  },
  {
    title: "Recommend the right starting point",
    body: "A live session, coaching, or something else. You decide together whether working with Manisha is the right fit.",
  },
];

/** Side-by-side option cards that lift a little on hover. */
const liftCard =
  "flex h-full flex-col bg-paper p-7 transition-[translate,box-shadow,border-color] duration-300 ease-shift hover:-translate-y-1 hover:border-jamun-200 hover:shadow-[0_18px_40px_-24px_rgba(42,22,54,0.35)] motion-reduce:hover:translate-y-0";

/** "I'll deal with it later." The script this page exists to interrupt. */
const laterScript = statements.find((s) => s.script === "I'll deal with it later.") ?? statements[statements.length - 1];

export default function BookPage() {
  // Only embed a real https scheduling link; anything else falls back to the request form.
  const bookingUrl = /^https:\/\/\S+$/.test(site.bookingUrl) ? site.bookingUrl : "";

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Book a clarity call", path: "/book" },
        ])}
      />

      <Section tone="paper" className="pt-12 pb-20 md:pt-16" aria-labelledby="book-title">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-12">
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="eyebrow text-marigold-700">Free clarity call</p>
            <AnimatedHeadline id="book-title" className="display-lg mt-4">
              Book a free clarity call with Manisha
            </AnimatedHeadline>
            <Reveal delay={0.35}>
              <p className="lede mt-6 text-muted">
                One conversation about where you are, where you want to be, and the right first step. It&apos;s free.
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <Card className="relative p-6 sm:p-8">
              {bookingUrl ? (
                <>
                  <h2 className="display-sm">Choose a time</h2>
                  <p className="mt-2 mb-6 text-[0.9375rem] text-muted">Pick a slot that suits you.</p>
                  <BookingEmbed url={bookingUrl} embedDomain={site.domain} />
                </>
              ) : (
                <>
                  <h2 className="display-sm">Request a time</h2>
                  <p className="mt-2 mb-6 text-[0.9375rem] text-muted">
                    Tell us when usually suits you, and Manisha&apos;s team will message you on WhatsApp to confirm a
                    time.
                  </p>
                  <BookingForm />
                </>
              )}
              <Beam />
            </Card>
          </Reveal>

          <div className="lg:col-start-1 lg:row-start-2">
            <Reveal>
              <h2 className="display-sm">What happens on the call</h2>
            </Reveal>
            <StaggerOl stagger={0.14} className="mt-6 flex flex-col gap-6">
              {callSteps.map((step, i) => (
                <StaggerOlItem key={step.title} className="flex gap-5">
                  <span
                    aria-hidden="true"
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-jamun-900/20 bg-white font-display text-lg text-marigold-700"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg leading-snug font-semibold text-jamun-900">{step.title}</h3>
                    <p className="mt-1 text-muted">{step.body}</p>
                  </div>
                </StaggerOlItem>
              ))}
            </StaggerOl>
          </div>
        </div>
      </Section>

      <Section tone="white" aria-labelledby="alternatives-title">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow text-marigold-700">Not ready to book yet?</p>
              <h2 id="alternatives-title" className="display-md mt-4">
                Take a smaller first step
              </h2>
            </Reveal>
            {laterScript ? (
              <Reframe script={laterScript.script} shift={laterScript.shift} size="lg" className="mt-8" />
            ) : null}
          </div>

          <Stagger stagger={0.12} className="grid gap-5 sm:grid-cols-2">
            <StaggerItem className="h-full">
              <Card className={liftCard}>
                <h3 className="display-sm">Ask a quick question</h3>
                <p className="mt-3 flex-1 text-[0.9875rem] text-muted">
                  Message Manisha&apos;s team on WhatsApp. Hours: {site.contact.hours}.
                </p>
                <ButtonLink
                  href={whatsappLink("Hi Manisha, I'd like to know more before booking a clarity call.")}
                  variant="dark"
                  icon={<WhatsAppIcon />}
                  className="mt-6"
                >
                  Chat on WhatsApp
                </ButtonLink>
              </Card>
            </StaggerItem>
            <StaggerItem className="h-full">
              <Card className={liftCard}>
                <h3 className="display-sm">Warm up with the assessment</h3>
                <p className="mt-3 flex-1 text-[0.9875rem] text-muted">
                  {statements.length} statements that show where your power is leaking. Bring your results to the call.
                </p>
                <ButtonLink href="/assessment" variant="outline" arrow className="mt-6 text-balance">
                  Take the free Power Self-Assessment
                </ButtonLink>
              </Card>
            </StaggerItem>
          </Stagger>
        </div>
      </Section>
    </>
  );
}
