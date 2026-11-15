import Link from "next/link";
import { site } from "@/content/site";
import { programs } from "@/content/programs";
import { pageMetadata } from "@/lib/seo";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { BusinessDetails, EmailLink, WhatsAppTextLink } from "@/components/legal/bits";

/*
 * Terms & conditions.
 *
 * LEGAL REVIEW REQUIRED: plain-language draft based on how the business
 * actually works. Have a lawyer review it before launch, and update
 * site.legal.lastUpdated whenever it changes.
 *
 * The money-back guarantee is rendered from programs.ts so it always matches
 * the wording on the program pages.
 */

export const metadata = pageMetadata({
  title: "Terms & conditions",
  description: `The terms for using ${site.domain} and booking coaching, live sessions, programs and merch from ${site.brand}.`,
  path: "/terms",
});

const guaranteed = programs.filter((p) => p.guarantee);

const sections: LegalSection[] = [
  {
    id: "about-these-terms",
    title: "About these terms",
    body: (
      <>
        <p>
          These terms apply when you use {site.domain} or book anything from {site.brand}, the coaching practice run by{" "}
          {site.legal.entityName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By registering, applying, paying or ordering,
          you agree to them. Please read them together with our <Link href="/privacy-policy">privacy policy</Link>,{" "}
          <Link href="/refund-policy">refund &amp; cancellation policy</Link> and{" "}
          <Link href="/shipping-policy">shipping &amp; delivery policy</Link>.
        </p>
        <BusinessDetails />
      </>
    ),
  },
  {
    id: "our-services",
    title: "Our services",
    body: (
      <>
        <p>We offer:</p>
        <ul>
          <li>
            <strong>Coaching:</strong> private leadership coaching and guided growth programs, delivered online;
          </li>
          <li>
            <strong>Live sessions:</strong> free masterclasses and paid workshops, held online on Zoom;
          </li>
          <li>
            <strong>Corporate training:</strong> workshops and programs for organisations, agreed in a written
            proposal;
          </li>
          <li>
            <strong>The Power Self-Assessment:</strong> a free self-reflection tool on this website;
          </li>
          <li>
            <strong>Merch:</strong> journals, cards and other products, shipped within India.
          </li>
        </ul>
        <p>
          Each program or product page describes what&rsquo;s included, the format, the date and time (in Indian
          Standard Time) and the price. That description forms part of these terms.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Who can use our services",
    body: (
      <p>
        You must be 18 or older to register, apply, pay or order. Please give accurate details: we use them to send
        joining links, receipts and deliveries.
      </p>
    ),
  },
  {
    id: "registration-and-payments",
    title: "Registration and payments",
    body: (
      <>
        <ul>
          <li>All prices are in Indian rupees (₹) and include GST where it applies.</li>
          <li>
            Payments are processed securely by <strong>Razorpay</strong>, using the methods it offers at checkout (such
            as UPI, cards and net banking). We never see or store your card or UPI details.
          </li>
          <li>
            Your place in a paid session, or your order, is confirmed once the payment succeeds. You&rsquo;ll receive a
            confirmation with a reference number.
          </li>
          <li>
            Fees for coaching programs and corporate training are agreed with you in writing before you pay.
          </li>
          <li>
            We may change prices for future bookings. The price you pay is the price shown when you check out.
          </li>
          <li>
            If money leaves your account but you don&rsquo;t get a confirmation, don&rsquo;t pay again. Email{" "}
            <EmailLink /> or message us on <WhatsAppTextLink message="Hi, my payment went through but I didn't get a confirmation." /> with
            your payment reference and we&rsquo;ll sort it out.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "live-sessions",
    title: "Live sessions",
    body: (
      <>
        <ul>
          <li>
            Live sessions happen online on Zoom at the time shown on the event page, in Indian Standard Time (IST).
            You&rsquo;ll need a stable internet connection and the Zoom app or a browser.
          </li>
          <li>
            Sessions are live and are not recorded, unless the program page says a recording is included. Please don&rsquo;t record sessions yourself: other participants share personal experiences.
          </li>
          <li>
            Your joining link is personal to you. Please don&rsquo;t share or forward it.
          </li>
          {/* TODO(client): confirm the rescheduling and cancellation promise below. */}
          <li>
            If we have to reschedule or cancel a session, we&rsquo;ll tell you as early as we can. For a paid session,
            you can join on the new date or ask for a full refund.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "money-back-guarantee",
    title: "Money-back guarantee",
    body: (
      <>
        {guaranteed.length ? (
          <>
            <p>
              {guaranteed.length === 1 ? "This program comes" : "These programs come"} with a money-back guarantee,
              exactly as stated on {guaranteed.length === 1 ? "its page" : "their pages"}:
            </p>
            {guaranteed.map((p) => (
              <div key={p.slug} className="space-y-3">
                <h3>{p.title}</h3>
                <blockquote>{p.guarantee}</blockquote>
              </div>
            ))}
            <p>
              To claim it, follow the steps in our <Link href="/refund-policy#paid-workshops">refund policy</Link>.
            </p>
          </>
        ) : (
          <p>
            Refunds are covered by our <Link href="/refund-policy">refund &amp; cancellation policy</Link>.
          </p>
        )}
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Our content and materials",
    body: (
      <>
        <p>
          Everything we share with you, including session content, slides, worksheets, frameworks, the{" "}
          <strong>Power Self-Assessment</strong> and the text and design of this website, is © {site.legal.entityName}
          , unless stated otherwise.
        </p>
        <p>
          You may use it for your own personal growth. You may not copy, record, sell, publish or use it to coach,
          train or teach others without our written permission.
        </p>
      </>
    ),
  },
  {
    id: "conduct",
    title: "How we treat each other",
    body: (
      <>
        <p>Our sessions and community work because people feel safe to speak honestly. So we ask you to:</p>
        <ul>
          <li>be respectful, even when you disagree;</li>
          <li>keep what other participants share confidential;</li>
          <li>not harass, abuse or discriminate against anyone;</li>
          <li>not promote your own products or services, or send unsolicited messages to other members.</li>
        </ul>
        <p>We may remove anyone who doesn&rsquo;t follow these rules from a session or from the WhatsApp community.</p>
      </>
    ),
  },
  {
    id: "not-therapy-or-advice",
    title: "Coaching is not therapy or professional advice",
    body: (
      <>
        <p>
          Coaching helps you build clarity, confidence and skills. It is not therapy, counselling or medical
          treatment, and it is not financial, legal or other professional advice. You stay responsible for your own
          decisions and actions.
        </p>
        <p>
          If you are struggling with your mental health, please speak to a qualified professional. In India, you can
          call Tele-MANAS, the government&rsquo;s free mental health helpline, on <a href="tel:14416">14416</a>. In
          an emergency, call <a href="tel:112">112</a>.
        </p>
      </>
    ),
  },
  {
    id: "no-guaranteed-results",
    title: "Results",
    body: (
      <p>
        Results depend on many things, including your own effort and circumstances, so we can&rsquo;t guarantee any
        particular outcome, promotion or result. Testimonials on this site are real experiences shared by participants;
        they are not a promise that your results will be the same.
      </p>
    ),
  },
  {
    id: "other-services",
    title: "Services we rely on",
    body: (
      <p>
        We use Zoom for live sessions, WhatsApp for community updates, Razorpay for payments and courier partners for
        deliveries. Your use of those services is also subject to their own terms. We aren&rsquo;t responsible for
        their outages, but we&rsquo;ll help you as much as we can if something goes wrong.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <>
        <p>To the extent the law allows:</p>
        <ul>
          <li>
            our total liability to you for any claim about a service or product is limited to the amount you paid us
            for it;
          </li>
          <li>
            we are not liable for indirect or consequential losses, such as lost income or opportunities, arising from
            your use of our services or this website.
          </li>
        </ul>
        <p>
          Nothing in these terms limits any right you have under Indian consumer protection law that cannot be
          limited.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these terms from time to time and will change the &ldquo;Last updated&rdquo; date when we do.
        The terms in force when you book or order apply to that booking or order.
      </p>
    ),
  },
  {
    id: "governing-law",
    title: "Governing law",
    body: (
      <p>
        These terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the
        courts at {site.legal.jurisdiction}. Before going to court, please contact us: most problems can be solved with
        a conversation.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <>
        <p>
          For any question about these terms, email <EmailLink subject="Question about your terms" /> or visit our{" "}
          <Link href="/contact">contact page</Link>.
        </p>
        <BusinessDetails />
      </>
    ),
  },
];

const guaranteeSection = sections.findIndex((s) => s.id === "money-back-guarantee") + 1;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & conditions"
      path="/terms"
      intro={`The agreement between you and ${site.brand} when you use this site or book a session, program or product.`}
      summary={[
        "Our services are for adults aged 18 and over.",
        "Prices are in Indian rupees and include GST where it applies. Payments are processed securely by Razorpay.",
        "Live sessions happen on Zoom and are not recorded unless the program says so. Your joining link is just for you.",
        guaranteed.length ? (
          <>
            The {guaranteed.map((p) => p.shortTitle.toLowerCase()).join(" and ")} {guaranteed.length === 1 ? "has" : "have"} a
            money-back guarantee: see <a href="#money-back-guarantee">section {guaranteeSection}</a>.
          </>
        ) : (
          "Refunds are covered by our refund & cancellation policy."
        ),
        "Coaching is not therapy, medical, financial or legal advice, and no particular result is guaranteed.",
        `Indian law applies, with courts at ${site.legal.jurisdiction}.`,
      ]}
      sections={sections}
    />
  );
}
