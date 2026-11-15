import Link from "next/link";
import { site } from "@/content/site";
import { shipping } from "@/content/merch";
import { formatINR } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { BusinessDetails, EmailLink, WhatsAppTextLink } from "@/components/legal/bits";

/*
 * Shipping & delivery policy (required by Razorpay before live payments).
 * Fees and timings come from the `shipping` object in src/content/merch.ts,
 * so this page always matches what checkout charges.
 *
 * LEGAL REVIEW REQUIRED: have a lawyer review this page before launch, and
 * update site.legal.lastUpdated whenever it changes.
 */

export const metadata = pageMetadata({
  title: "Shipping & delivery policy",
  description: `Where ${site.brand} ships merch, what it costs (free on orders of ${formatINR(shipping.freeAbove)} or more), how long delivery takes, and how online sessions are delivered.`,
  path: "/shipping-policy",
});

const fee = formatINR(shipping.flatFee);
const freeAbove = formatINR(shipping.freeAbove);

const sections: LegalSection[] = [
  {
    id: "where-we-ship",
    title: "Where we ship",
    body: (
      <p>
        We ship merch to addresses in <strong>{shipping.region}</strong> only. We can&rsquo;t ship to addresses outside{" "}
        {shipping.region} at the moment.
      </p>
    ),
  },
  {
    id: "shipping-charges",
    title: "Shipping charges",
    body: (
      <>
        <ul>
          <li>
            Shipping is a flat <strong>{fee}</strong> per order.
          </li>
          <li>
            It&rsquo;s <strong>free</strong> when the items in your order add up to {freeAbove} or more.
          </li>
        </ul>
        <p>Your cart shows the shipping charge before you pay. All prices include GST where it applies.</p>
      </>
    ),
  },
  {
    id: "dispatch-and-delivery",
    title: "Dispatch and delivery times",
    body: (
      <>
        <ul>
          <li>{shipping.dispatch}.</li>
          <li>{shipping.delivery}.</li>
        </ul>
        <p>
          Deliveries to remote PIN codes, and during festivals, heavy rain or other disruptions, can take longer. If
          your order is delayed, we&rsquo;ll keep you posted.
        </p>
      </>
    ),
  },
  {
    id: "tracking",
    title: "Tracking your order",
    body: (
      <p>
        Once your order is dispatched, we&rsquo;ll send you the courier name and tracking details on WhatsApp and by
        email. If you haven&rsquo;t received them within the dispatch time above, message us on{" "}
        <WhatsAppTextLink message="Hi, I'd like an update on my merch order." /> with your order reference.
      </p>
    ),
  },
  {
    id: "your-address",
    title: "Getting your address right",
    body: (
      <p>
        Please enter your full address, PIN code and a mobile number the courier can reach. We can&rsquo;t change the
        address once an order has been dispatched, so if you spot a mistake, contact us straight away.
      </p>
    ),
  },
  {
    id: "failed-delivery",
    title: "If delivery doesn't succeed",
    body: (
      <>
        {/* TODO(client): confirm how re-delivery of returned parcels is handled and charged. */}
        <p>
          If the courier can&rsquo;t deliver your parcel, for example because the address is incomplete or no one is
          available to receive it, the parcel may come back to us. We&rsquo;ll contact you to arrange delivery again.
          If the delivery failed because of incorrect details, we may ask you to pay the shipping charge again.
        </p>
        <p>
          If your order arrives damaged, defective or isn&rsquo;t what you ordered, see our{" "}
          <Link href="/refund-policy#merch">refund &amp; cancellation policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "online-services",
    title: "Sessions and coaching (delivered online)",
    body: (
      <>
        <p>Our coaching, masterclasses and workshops are delivered online, so nothing is shipped:</p>
        <ul>
          <li>Live sessions take place on Zoom at the date and time shown on the event page (IST).</li>
          <li>
            After you register, you receive the joining details and updates on WhatsApp (through our community) or by
            email.
          </li>
          <li>Coaching sessions are scheduled with you directly after you sign up.</li>
        </ul>
        <p>
          If you haven&rsquo;t received your joining details by the day of the session, email <EmailLink /> or message
          us on <WhatsAppTextLink message="Hi, I registered for a session but haven't received the joining details." />.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: <BusinessDetails />,
  },
];

export default function ShippingPolicyPage() {
  return (
    <LegalPage
      title="Shipping & delivery policy"
      path="/shipping-policy"
      intro="How merch orders reach you, and how our online sessions are delivered."
      summary={[
        `We ship merch within ${shipping.region} only.`,
        `Shipping is a flat ${fee} per order, and free on orders of ${freeAbove} or more.`,
        `${shipping.dispatch}. ${shipping.delivery}.`,
        "Tracking details are shared on WhatsApp and by email once your order is dispatched.",
        "Sessions and coaching happen online on Zoom, so there's nothing to ship. Joining details come by WhatsApp or email.",
      ]}
      sections={sections}
    />
  );
}
