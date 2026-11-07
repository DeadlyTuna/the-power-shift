import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { site, whatsappLink } from "@/content/site";
import { cn } from "@/lib/cn";
import { organizationJsonLd, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/shared/JsonLd";
import { Card, Section } from "@/components/ui/Layout";
import { WhatsAppIcon } from "@/components/ui/icons";
import { ContactForm } from "@/components/contact/ContactForm";
import { Beam } from "@/components/contact/FormMotion";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerList, StaggerListItem } from "@/components/motion/Stagger";

export const metadata = pageMetadata({
  title: "Contact",
  description: `Contact ${site.coach} and the ${site.brand} team about programs, corporate training or a merch order, on WhatsApp, by phone, by email or with the contact form.`,
  path: "/contact",
});

function ChannelRow({
  icon,
  label,
  children,
  href,
  external,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  href?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-mist text-jamun-900 [&>svg]:size-[1.15rem]"
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm text-muted">{label}</span>
        <span
          className={cn(
            "font-semibold break-words text-jamun-900",
            href && "underline decoration-marigold-400 decoration-2 underline-offset-4 group-hover:decoration-jamun-900",
          )}
        >
          {children}
        </span>
      </span>
    </>
  );

  return (
    <StaggerListItem>
      {href ? (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="group flex min-h-16 items-center gap-4 py-3"
        >
          {content}
        </a>
      ) : (
        <div className="flex min-h-16 items-center gap-4 py-3">{content}</div>
      )}
    </StaggerListItem>
  );
}

const shortcuts = [
  { lead: "Training for your team?", label: "See corporate training", href: "/corporate" },
  { lead: "Ready to talk it through?", label: "Book a clarity call", href: "/book" },
  { lead: "Not sure where to start?", label: "Take the Power Self-Assessment", href: "/assessment" },
];

export default function ContactPage() {
  const { contact, legal } = site;

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <Section tone="paper" className="pt-14 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow text-marigold-700">Contact</p>
              <h1 className="display-lg mt-4">Let&rsquo;s talk</h1>
              <p className="lede mt-5 max-w-[34rem] text-muted">
                Ask about a program, plan a session for your team, or check on a merch order. Send a message, or reach
                us directly.
              </p>
            </Reveal>

            <StaggerList stagger={0.07} className="mt-10 flex flex-col divide-y divide-line border-y border-line">
              <ChannelRow icon={<WhatsAppIcon />} label="WhatsApp" href={whatsappLink()} external>
                Message {contact.phoneDisplay}
              </ChannelRow>
              <ChannelRow icon={<Phone />} label="Phone" href={`tel:${contact.phoneE164}`}>
                {contact.phoneDisplay}
              </ChannelRow>
              <ChannelRow icon={<Mail />} label="Email" href={`mailto:${contact.email}`}>
                {contact.email}
              </ChannelRow>
              <ChannelRow icon={<Clock />} label="Hours">
                {contact.hours}
              </ChannelRow>
              {/*
                TODO(client): Razorpay asks for a business address on the Contact page before
                activating live payments. Set site.legal.address and it appears here.
              */}
              {legal.address ? (
                <ChannelRow icon={<MapPin />} label="Address">
                  <span className="font-normal">{legal.address}</span>
                </ChannelRow>
              ) : null}
            </StaggerList>

            <Reveal className="mt-12">
              <nav aria-labelledby="contact-shortcuts">
                <h2 id="contact-shortcuts" className="eyebrow text-marigold-700">
                  Looking for something specific?
                </h2>
                <ul className="mt-4 flex flex-col gap-1">
                  {shortcuts.map((s) => (
                    <li key={s.href}>
                      <Link href={s.href} className="group flex min-h-11 flex-wrap items-center gap-x-2 py-1.5">
                        <span className="text-muted">{s.lead}</span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-jamun-900 underline decoration-marigold-400 decoration-2 underline-offset-4 group-hover:decoration-jamun-900">
                          {s.label}
                          <ArrowRight
                            aria-hidden="true"
                            className="size-4 transition-transform duration-200 ease-shift group-hover:translate-x-1"
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </Reveal>
          </div>

          <Reveal delay={0.12} className="self-start rounded-card">
            <Card className="relative p-6 sm:p-10">
              <ContactForm />
              <Beam />
            </Card>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
