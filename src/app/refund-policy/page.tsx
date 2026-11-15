import Link from "next/link";
import { site } from "@/content/site";
import { programs } from "@/content/programs";
import { pageMetadata } from "@/lib/seo";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { BusinessDetails, EmailLink, WhatsAppTextLink } from "@/components/legal/bits";

/*
 * Refund & cancellation policy (required by Razorpay before live payments).
 *
 * LEGAL REVIEW REQUIRED: have a lawyer review this page before launch, and
 * update site.legal.lastUpdated whenever it changes.
 *
 * The workshop guarantee is rendered from programs.ts so it always matches
 * the program pages.
 */

export const metadata = pageMetadata({
  title: "Refund & cancellation policy",
  description: `How refunds and cancellations work for ${site.brand} sessions, coaching programs and merch orders.`,
  path: "/refund-policy",
});

const freeEvents = programs.filter((p) => p.mode === "free");
const paidEvents = programs.filter((p) => p.mode === "paid");
const guaranteedEvents = paidEvents.filter((p) => p.guarantee);

/*
 * TODO(client): confirm the merch rules (7-day reporting window, photos,
 * replacement or refund, cancellation before dispatch, shipping refunded on
 * cancelled orders, who pays return postage) and the refund timing
 * (5–7 working days after approval, to the original payment method).
 */
const MERCH_REPORT_DAYS = 7;
const REFUND_TIMING = "5–7 working days";

const sections: LegalSection[] = [
  {
    id: "free-sessions",
    title: "Free sessions",
    body: (
      <>
        <p>
          {freeEvents.length
            ? `Free sessions such as the ${freeEvents.map((p) => p.shortTitle).join(" and ")} cost nothing, so there is nothing to refund.`
            : "Free sessions cost nothing, so there is nothing to refund."}
        </p>
        <p>
          If you can&rsquo;t make it, you don&rsquo;t need to cancel. If you{" "}
          <WhatsAppTextLink message="Hi, I can't attend the free session I registered for.">let us know on WhatsApp</WhatsAppTextLink>
          , we can offer your seat to someone else.
        </p>
      </>
    ),
  },
  {
    id: "paid-workshops",
    title: "Paid live workshops",
    body: (
      <>
        {guaranteedEvents.map((p) => (
            <div key={p.slug} className="space-y-3">
              <h3>{p.title}: money-back guarantee</h3>
              <blockquote>{p.guarantee}</blockquote>
            </div>
          ))}
        <h3>How to claim a refund</h3>
        <p>
          After the session, email <EmailLink subject="Workshop refund request" /> or message us on{" "}
          <WhatsAppTextLink message="Hi, I attended the workshop and would like to request a refund." /> with the name
          and email you registered with and your payment reference. We&rsquo;ll confirm your refund and send it to your
          original payment method.
        </p>
        <h3>If you can&rsquo;t attend</h3>
        <p>
          These are live workshops, so please plan to attend. If something comes up, message us on WhatsApp before the
          session starts and we&rsquo;ll tell you your options.
        </p>
        {/* TODO(client): confirm this promise (it matches the Terms). */}
        <h3>If we reschedule or cancel</h3>
        <p>
          If we have to move or cancel a paid session, we&rsquo;ll tell you as early as we can. You can join on the
          new date or ask for a full refund.
        </p>
      </>
    ),
  },
  {
    id: "coaching-programs",
    title: "Coaching and corporate programs",
    body: (
      <>
        <p>
          For 1:1 coaching, guided programs and corporate training, the fee, schedule, rescheduling rules and any
          cancellation or refund terms are agreed with you in writing before you pay. Those written terms apply to
          your engagement.
        </p>
        <p>If something isn&rsquo;t covered there, contact us and we&rsquo;ll work it out with you fairly.</p>
      </>
    ),
  },
  {
    id: "merch",
    title: "Merch orders",
    body: (
      <>
        <h3>Cancelling an order</h3>
        <p>
          You can cancel an order any time before it is dispatched, and we&rsquo;ll refund the full amount you paid,
          including shipping. Once an order has been dispatched, it can no longer be cancelled.
        </p>
        <h3>Damaged, defective or wrong items</h3>
        <p>
          If an item arrives damaged or defective, or isn&rsquo;t what you ordered, tell us within{" "}
          <strong>{MERCH_REPORT_DAYS} days of delivery</strong>. Send your order reference and clear photos of the item
          and its packaging. Once we&rsquo;ve checked them, we&rsquo;ll send you a replacement or refund you for the
          item. If we need the item back, we&rsquo;ll tell you how to return it.
        </p>
        <p>
          Delivery times and charges are explained in our{" "}
          <Link href="/shipping-policy">shipping &amp; delivery policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "how-refunds-are-paid",
    title: "How refunds are paid",
    body: (
      <>
        <p>
          Approved refunds go back to your original payment method through Razorpay, usually within{" "}
          <strong>{REFUND_TIMING}</strong> after approval. Your bank or card issuer may take a little longer to show it
          on your statement.
        </p>
        <p>We&rsquo;ll send you a confirmation when the refund is processed.</p>
      </>
    ),
  },
  {
    id: "how-to-ask",
    title: "How to ask for a refund or cancellation",
    body: (
      <>
        <p>
          Email <EmailLink subject="Refund or cancellation request" /> or message us on{" "}
          <WhatsAppTextLink message="Hi, I'd like to request a refund or cancellation." />. Please include:
        </p>
        <ul>
          <li>the name and email address you booked or ordered with;</li>
          <li>your payment or order reference;</li>
          <li>what you&rsquo;d like us to do, and why;</li>
          <li>for merch problems, photos of the item and packaging.</li>
        </ul>
        <p>We&rsquo;ll confirm we&rsquo;ve received your request and let you know the outcome.</p>
        <BusinessDetails />
      </>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund & cancellation policy"
      path="/refund-policy"
      intro="What happens if a session isn't right for you, if plans change, or if an order arrives damaged."
      summary={[
        "Free sessions cost nothing, so there's nothing to refund.",
        guaranteedEvents.length ? (
          <>
            The {guaranteedEvents.map((p) => p.shortTitle.toLowerCase()).join(" and ")}{" "}
            {guaranteedEvents.length === 1 ? "has" : "have"} a money-back guarantee: attend, and if you didn&rsquo;t get
            practical tools you can use, ask for a full refund after the session.
          </>
        ) : (
          "Paid sessions are refunded in full if we cancel and you can't make the new date."
        ),
        "Coaching and corporate programs follow the terms agreed in writing before you pay.",
        `Merch orders can be cancelled before dispatch. Report damaged, defective or wrong items within ${MERCH_REPORT_DAYS} days of delivery for a replacement or refund.`,
        `Refunds go back to your original payment method, usually within ${REFUND_TIMING} after approval.`,
      ]}
      sections={sections}
    />
  );
}
