import Link from "next/link";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
import { BusinessDetails, EmailLink, PhoneLink, WhatsAppTextLink } from "@/components/legal/bits";

/*
 * Privacy policy, written for India's Digital Personal Data Protection Act,
 * 2023 (DPDP Act) and the rules made under it.
 *
 * LEGAL REVIEW REQUIRED: this is a plain-language draft prepared with the
 * site's real data flows. Have a lawyer review it before launch, and update
 * site.legal.lastUpdated whenever it changes.
 *
 * Some lines depend on configuration, so the policy always matches what the
 * site actually does: the analytics paragraphs appear only when
 * NEXT_PUBLIC_META_PIXEL_ID / NEXT_PUBLIC_GA_ID are set, and the scheduling
 * service only when NEXT_PUBLIC_BOOKING_URL is set.
 */

export const metadata = pageMetadata({
  title: "Privacy policy",
  description: `How ${site.brand} collects, uses and protects your personal data, and how to exercise your rights under India's Digital Personal Data Protection Act, 2023.`,
  path: "/privacy-policy",
});

const pixelEnabled = Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID);
const gaEnabled = Boolean(process.env.NEXT_PUBLIC_GA_ID);
const analyticsEnabled = pixelEnabled || gaEnabled;

function schedulingServiceName(url: string): string | null {
  if (!url) return null;
  if (/calendly\.com/i.test(url)) return "Calendly";
  if (/cal\.com/i.test(url)) return "Cal.com";
  return "our online scheduling service";
}
const schedulingService = schedulingServiceName(site.bookingUrl);

const touchpoints: { title: string; body: string }[] = [
  {
    title: "Registering for a masterclass or workshop",
    body: "Your name, email address and mobile number, and which session you registered for.",
  },
  {
    title: "Applying for coaching",
    body: "Your name, email address and mobile number, and whatever you choose to tell us about your role and goals.",
  },
  {
    title: "Corporate enquiries",
    body: "Your name, work email, phone number, organisation and role, and what your team needs.",
  },
  {
    title: "Requesting a clarity call",
    body: schedulingService
      ? `Your name, email address, mobile number and preferred times. If you book through ${schedulingService}, that service collects your booking details and shares them with us.`
      : "Your name, email address, mobile number and preferred times.",
  },
  {
    title: "The contact form",
    body: "Your name, email address, phone number (optional), the topic you pick and your message.",
  },
  {
    title: "The Power Self-Assessment",
    body: "Your answers are scored in your own browser and saved only there (in its local storage, under the name tps:assessment:v1) so you can pick up where you left off. Nothing from the assessment is sent to us unless you fill in the “Email me my results” form on your results page. If you do, we receive your name, email address, your WhatsApp number if you add it, your answers, the statement you chose to focus on, and your scores (which we recalculate from your answers).",
  },
  {
    title: "Merch orders",
    body: "Your name, email address, mobile number, shipping address, what you ordered and the order total.",
  },
  {
    title: "Payments",
    body: "Payments are processed by Razorpay. We receive the payment and order references, the amount, the payment status, and the email address and phone number you entered at checkout. We never see or store your card number, CVV, UPI PIN or net banking password.",
  },
  {
    title: "WhatsApp",
    body: "If you message us or join our WhatsApp community, we see your WhatsApp name, your number and the messages you send.",
  },
  {
    title: "Visiting the website",
    body: "Our hosting provider automatically records technical details such as your IP address, browser type and the pages requested, to keep the site secure and working.",
  },
];

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          This website, {site.domain}, is run by {site.legal.entityName}, who offers leadership and life coaching under
          the name {site.brand} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). Under India&rsquo;s Digital Personal Data
          Protection Act, 2023 (the &ldquo;DPDP Act&rdquo;), we are the <strong>Data Fiduciary</strong> for the
          personal data you share with us: we decide why and how it is used. You are the{" "}
          <strong>Data Principal</strong>.
        </p>
        <BusinessDetails />
        <p>
          This policy covers this website, our forms, live sessions, coaching, merch orders and our WhatsApp
          conversations. It does not cover other websites we link to.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect, and when",
    body: (
      <>
        <p>
          We only collect what you give us and what we need to do what you asked. Fields marked
          &ldquo;optional&rdquo; really are optional. With every form we also note which page you used and when, so we
          know which program or event you&rsquo;re asking about.
        </p>
        <dl className="flex flex-col gap-4">
          {touchpoints.map((t) => (
            <div key={t.title} className="rounded-xl border border-line bg-white px-5 py-4">
              <dt className="font-semibold text-jamun-900">{t.title}</dt>
              <dd className="mt-1">{t.body}</dd>
            </div>
          ))}
        </dl>
        <p>
          Please don&rsquo;t send us sensitive details we haven&rsquo;t asked for, such as health information or
          identity documents.
        </p>
      </>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use your data",
    body: (
      <>
        <p>We use your personal data only for the purpose you shared it for:</p>
        <ul>
          <li>to register you for a session and send you the joining details, reminders and updates about it;</li>
          <li>to reply to your enquiry, application, booking request or message;</li>
          <li>to deliver coaching and programs you sign up for;</li>
          <li>to process payments, orders, deliveries and refunds, and to send you receipts and order updates;</li>
          <li>to keep the records that tax and accounting laws require;</li>
          <li>to protect the site and our forms from spam and misuse.</li>
        </ul>
        <p>
          If you agree to it, we may also tell you about future sessions and programs by email or WhatsApp. You can
          ask us to stop at any time, and we will.
        </p>
        <p>
          {analyticsEnabled
            ? "We also look at aggregated website statistics to understand which pages help people and which don't (see Cookies and browser storage)."
            : "We do not currently use analytics or advertising tools on this website."}
        </p>
        <p>We never sell your personal data.</p>
      </>
    ),
  },
  {
    id: "legal-basis",
    title: "Why we're allowed to use it",
    body: (
      <>
        <p>
          We rely on your <strong>consent</strong>. Each of our forms asks you to agree before you send it, and tells
          you what the details will be used for. Your consent covers only that purpose.
        </p>
        <p>
          You can withdraw your consent at any time, as easily as you gave it (see <a href="#your-rights">Your rights</a>
          ). Withdrawing doesn&rsquo;t affect anything we did before you withdrew. If you withdraw consent for something
          we need to provide a service, such as your email address for a session&rsquo;s joining link, we may not be
          able to continue providing it.
        </p>
        <p>
          Where the law requires us to keep certain data, for example invoices and payment records under tax law, we
          keep it for that purpose only, as the DPDP Act permits.
        </p>
      </>
    ),
  },
  {
    id: "who-we-share-it-with",
    title: "Who we share it with",
    body: (
      <>
        <p>
          We share personal data only with the service providers we use to run our work (&ldquo;Data
          Processors&rdquo;), and only what each one needs:
        </p>
        <ul>
          <li>
            <strong>Razorpay</strong> processes payments and refunds.
          </li>
          {/* TODO(client): confirm where form submissions are stored (docs/SETUP.md recommends a Google Sheet). */}
          <li>
            <strong>Google (Google Workspace)</strong> stores the details you send through our forms in a private
            spreadsheet and delivers our email.
          </li>
          {/* TODO(client): confirm the hosting provider (docs/SETUP.md assumes Vercel). */}
          <li>
            <strong>Vercel</strong> hosts this website.
          </li>
          <li>
            <strong>WhatsApp (Meta)</strong> carries our one-to-one chats and community messages. In a WhatsApp group,
            other members may be able to see your name and number, depending on WhatsApp&rsquo;s settings.
          </li>
          <li>
            <strong>Zoom</strong> runs our live sessions. Other participants can see the name you join with and, if you
            turn them on, your video and audio.
          </li>
          {schedulingService ? (
            <li>
              <strong>{schedulingService}</strong> handles clarity-call bookings made through our scheduling page.
            </li>
          ) : null}
          {/* TODO(client): name the courier partner once chosen. */}
          <li>
            <strong>Courier partners</strong> receive your name, shipping address and phone number to deliver merch
            orders.
          </li>
          {pixelEnabled ? (
            <li>
              <strong>Meta (Facebook and Instagram)</strong> receives information about your visit through the Meta
              Pixel, so we can measure our ads.
            </li>
          ) : null}
          {gaEnabled ? (
            <li>
              <strong>Google Analytics</strong> receives information about your visit so we can see how the site is
              used.
            </li>
          ) : null}
        </ul>
        <p>
          We may also share data with our accountants and legal advisers, and with government or law-enforcement
          authorities when the law requires it.
        </p>
        <p>
          Some of these providers store data on servers outside India. The DPDP Act allows this, except to countries
          the Government of India restricts, and we will follow any such restriction.
        </p>
      </>
    ),
  },
  {
    id: "cookies-and-browser-storage",
    title: "Cookies and browser storage",
    body: (
      <>
        <p>This site keeps a few things in your own browser&rsquo;s storage, on your device:</p>
        <ul>
          <li>
            <strong>Your cart</strong> (stored as <code>tps-cart-v1</code>), so the merch you added is still there when
            you come back.
          </li>
          <li>
            <strong>Your assessment progress and results</strong> (stored as <code>tps:assessment:v1</code>), so you
            can finish the Power Self-Assessment later. &ldquo;Clear my answers from this browser&rdquo; on the results
            page removes them.
          </li>
        </ul>
        <p>
          We can&rsquo;t see this data unless you send it to us, for example by placing an order or using &ldquo;Email
          me my results&rdquo;. Clearing your browser&rsquo;s site data removes it.
          Razorpay&rsquo;s checkout window may use its own cookies to process your payment securely.
        </p>
        {analyticsEnabled ? (
          <>
            <p>We also use analytics cookies:</p>
            <ul>
              {pixelEnabled ? (
                <li>
                  The <strong>Meta Pixel</strong> sets cookies (such as <code>_fbp</code>) to measure visits that come
                  from our Facebook and Instagram ads.
                </li>
              ) : null}
              {gaEnabled ? (
                <li>
                  <strong>Google Analytics</strong> sets cookies (such as <code>_ga</code>) to count visits and see
                  which pages are used.
                </li>
              ) : null}
            </ul>
            <p>
              You can block or delete cookies in your browser settings. The site works without them, apart from
              anything you&rsquo;ve stored in your cart or assessment.
            </p>
          </>
        ) : (
          <p>We don&rsquo;t use advertising or analytics cookies at the moment.</p>
        )}
      </>
    ),
  },
  {
    id: "how-long-we-keep-it",
    title: "How long we keep it",
    body: (
      <>
        {/* TODO(client + lawyer): set concrete retention periods if you want to state them. */}
        <p>We keep personal data only as long as we need it for the purpose you shared it for:</p>
        <ul>
          <li>
            <strong>Enquiries, registrations and applications:</strong> until the purpose is complete (for example,
            the session has happened and any follow-up you asked for is done), or until you ask us to delete them,
            whichever comes first.
          </li>
          <li>
            <strong>Coaching clients:</strong> for as long as we work together, and then only what we need to keep for
            our records.
          </li>
          <li>
            <strong>Orders, payments and invoices:</strong> for the period Indian tax and accounting laws require.
          </li>
          <li>
            <strong>Assessment answers in your browser:</strong> until you clear your browser&rsquo;s site data.
          </li>
        </ul>
        <p>When we no longer need data, we delete it or make sure it can no longer identify you.</p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>Under the DPDP Act, you have the right to:</p>
        <ul>
          <li>
            <strong>Access</strong> a summary of the personal data we hold about you, what we do with it, and who we
            have shared it with;
          </li>
          <li>
            <strong>Correct</strong>, complete or update data that is inaccurate or out of date;
          </li>
          <li>
            <strong>Erase</strong> your data when it&rsquo;s no longer needed, unless the law requires us to keep it;
          </li>
          <li>
            <strong>Withdraw your consent</strong> at any time;
          </li>
          <li>
            <strong>Nominate</strong> someone to exercise these rights for you if you die or become unable to do so;
          </li>
          <li>
            <strong>Have your grievance heard</strong> by our Grievance Officer and, if you&rsquo;re not satisfied
            with the response, complain to the <strong>Data Protection Board of India</strong>.
          </li>
        </ul>
        <h3>How to use your rights</h3>
        <p>
          Email <EmailLink subject="Privacy request" /> or message us on{" "}
          <WhatsAppTextLink message="Hi, I'd like to make a privacy request." />, and tell us what you&rsquo;d like us
          to do. We may ask you to confirm your identity before we act, so we never hand your data to someone else.
          {/* TODO(client + lawyer): state a response time once agreed, within the limits set by the DPDP rules. */}{" "}
          We&rsquo;ll respond as soon as we can, and within the time the DPDP rules allow.
        </p>
        <p>
          To stop hearing from us about future programs, tell us by email or WhatsApp, or leave the WhatsApp
          community at any time.
        </p>
        <p>
          The DPDP Act also asks you to give accurate information and not to impersonate anyone when you share your
          details or make a request.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        Our services are for adults aged 18 and over, and we don&rsquo;t knowingly collect personal data from anyone
        under 18. If you believe a child has shared their details with us, please contact us and we will delete them.
      </p>
    ),
  },
  {
    id: "security",
    title: "How we protect your data",
    body: (
      <>
        <p>
          This site uses an encrypted (HTTPS) connection. Form submissions go to a private store, and we limit access
          to {site.legal.entityName} and the people who help run the business. Card and UPI payments happen entirely
          inside Razorpay&rsquo;s secure checkout.
        </p>
        <p>
          No system is perfectly secure. If a breach affecting your personal data ever happens, we will inform you and
          the Data Protection Board of India as the law requires, and tell you what we&rsquo;re doing about it.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We&rsquo;ll update this page when our practices change, and change the &ldquo;Last updated&rdquo; date at the
        top. If a change affects how we use data you&rsquo;ve already shared, we&rsquo;ll tell you by email or
        WhatsApp and ask for your consent again where the law requires it.
      </p>
    ),
  },
  {
    id: "grievance-officer",
    title: "Grievance Officer",
    body: (
      <>
        {/* TODO(client): confirm who acts as Grievance Officer (defaults to the business owner). */}
        <p>
          If you have a question or complaint about how we handle your personal data, contact our Grievance Officer:
        </p>
        <ul>
          <li>
            <strong>Name:</strong> {site.legal.entityName}
          </li>
          <li>
            <strong>Email:</strong> <EmailLink subject="Privacy grievance" />
          </li>
          <li>
            <strong>Phone:</strong> <PhoneLink />
          </li>
          {site.legal.address ? (
            <li>
              <strong>Address:</strong> {site.legal.address}
            </li>
          ) : null}
        </ul>
        <p>
          Please contact us first so we can put things right. If you&rsquo;re not satisfied with our response, you can
          complain to the Data Protection Board of India. You can also read our{" "}
          <Link href="/terms">terms &amp; conditions</Link>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      path="/privacy-policy"
      intro="What we collect, why, who helps us process it, and how you stay in control of it."
      summary={[
        "We collect only what you give us through our forms, orders and messages, plus basic technical details needed to run the site.",
        "We use it to do what you asked: save your seat, reply to you, deliver your order. We send updates about future programs only if you agree.",
        "We never sell your data. Payments go through Razorpay, and we never see your card or UPI details.",
        "Your assessment answers stay in your browser unless you ask us to email your results.",
        <>
          You can ask to see, correct or delete your data, or withdraw consent, at any time: email{" "}
          <EmailLink subject="Privacy request" />.
        </>,
      ]}
      sections={sections}
    />
  );
}
