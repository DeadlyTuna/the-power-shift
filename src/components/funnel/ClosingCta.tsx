import type { ReactNode } from "react";
import { Section } from "@/components/ui/Layout";
import { EventSwitch } from "./EventStatus";
import { RegisterCta } from "./RegisterCta";
import { WhatsAppLink } from "@/components/shared/WhatsAppLink";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The calm last word on a funnel page: one statement, one primary action,
 * WhatsApp for anyone with a question. The mobile sticky bar hides from here
 * on, so its id must match StickyRegisterBar's `endId`.
 */
export function ClosingCta({
  id = "closing",
  eyebrow,
  title,
  openBody,
  closedBody,
  openLabel,
  closedLabel,
  whatsappMessage,
  source,
  notes,
}: {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  openBody: ReactNode;
  closedBody: ReactNode;
  openLabel: string;
  closedLabel: string;
  whatsappMessage: string;
  source: string;
  /** Short facts shown under the buttons. */
  notes?: string[];
}) {
  const titleId = `${id}-title`;
  return (
    <Section tone="jamun" id={id} aria-labelledby={titleId}>
      <Reveal className="mx-auto max-w-3xl text-center">
        {eyebrow ? <p className="eyebrow mb-4 text-marigold-300">{eyebrow}</p> : null}
        <h2 id={titleId} className="display-lg text-white">
          {title}
        </h2>
        <div className="lede mx-auto mt-6 max-w-2xl text-jamun-100">
          <EventSwitch open={openBody} closed={closedBody} />
        </div>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <RegisterCta openLabel={openLabel} closedLabel={closedLabel} />
          <WhatsAppLink message={whatsappMessage} source={source} variant="on-dark" size="lg">
            Ask a question on WhatsApp
          </WhatsAppLink>
        </div>
        {notes?.length ? (
          <ul className="mt-10 flex flex-wrap justify-center gap-2 text-[0.9375rem] text-jamun-100">
            {notes.map((note) => (
              <li key={note} className="rounded-full border border-white/15 px-3.5 py-1.5 leading-tight">
                {note}
              </li>
            ))}
          </ul>
        ) : null}
      </Reveal>
    </Section>
  );
}
