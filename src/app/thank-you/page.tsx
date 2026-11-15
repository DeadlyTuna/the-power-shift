import type { Metadata } from "next";
import { getProgram, isEventOpen } from "@/content/programs";
import { ThankYouContent } from "@/components/thank-you/ThankYouContent";
import { pageMetadata } from "@/lib/seo";

/**
 * /thank-you: confirmation after a registration or payment.
 *
 * Query (both optional, both opaque, never personal data):
 *   program  program slug, e.g. ?program=be-heard-masterclass
 *   ref      our payment reference, e.g. ?ref=PS-LCW-MGD3K2QX
 * The legacy /thankyou and /thankyou-diamond URLs redirect here with no query.
 */

export const metadata: Metadata = pageMetadata({
  title: "You're in",
  description: "Your registration is confirmed. Join the WhatsApp community to get the joining link and updates.",
  path: "/thank-you",
  noindex: true,
});

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** Payment references are short opaque ids (ours, or a Razorpay payment id). Anything else is ignored. */
const REFERENCE = /^[A-Za-z0-9_-]{4,64}$/;

function single(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default async function ThankYouPage({ searchParams }: Props) {
  const query = await searchParams;

  const slug = single(query.program);
  const found = slug ? getProgram(slug) : undefined;
  // Only live events have a registration to confirm here.
  const program = found && (found.mode === "free" || found.mode === "paid") ? found : undefined;

  const rawReference = single(query.ref);
  const reference = rawReference && REFERENCE.test(rawReference) ? rawReference : undefined;

  // This page renders per request (it reads searchParams), so "now" is the visit time.
  const upcoming = program?.event ? isEventOpen(program) : false;

  return <ThankYouContent program={program} reference={reference} upcoming={upcoming} />;
}
