# Setup guide

Everything the site needs outside the code: environment variables, where form submissions go, payments, links, analytics and hosting. Work through it top to bottom the first time; each section stands alone after that.

- [1. Environment variables](#1-environment-variables)
- [2. Form submissions: Google Sheet + email alerts](#2-form-submissions-google-sheet--email-alerts)
- [3. Razorpay payments](#3-razorpay-payments)
- [4. Hosted payment link fallback](#4-hosted-payment-link-fallback)
- [5. WhatsApp community link](#5-whatsapp-community-link)
- [6. Booking link (Calendly or Cal.com)](#6-booking-link-calendly-or-calcom)
- [7. Meta Pixel and Google Analytics 4](#7-meta-pixel-and-google-analytics-4)
- [Deploying on Vercel](#deploying-on-vercel)

---

## 1. Environment variables

Copy `.env.example` to `.env.local` for local development. In production, set the same variables in Vercel under **Project → Settings → Environment Variables**.

| Variable | Needed | What it is |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | The public address, `https://itzmanisha.com`. Used for canonical links, the sitemap and social previews. |
| `LEADS_WEBHOOK_URL` | **Production (required)** | Where every form submission is sent. The Apps Script web app URL from section 2, or any webhook (Zapier, Make, Pabbly, n8n). Without it, production forms show an error rather than losing leads silently. In development, submissions are printed to the terminal instead. |
| `LEADS_WEBHOOK_SECRET` | With the webhook | A long random string sent with every submission so the webhook can reject forged requests. Must match the secret stored in the Apps Script. |
| `RAZORPAY_KEY_ID` | For online payments | `rzp_test_…` while testing, `rzp_live_…` when live. |
| `RAZORPAY_KEY_SECRET` | For online payments | The matching key secret. Server-only, never sent to the browser. |
| `RAZORPAY_WEBHOOK_SECRET` | For online payments | The secret you type when creating the Razorpay webhook (section 3). |
| `NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL` | Recommended | The `https://chat.whatsapp.com/…` invite link (section 5). |
| `NEXT_PUBLIC_BOOKING_URL` | Optional | Calendly or Cal.com link for clarity calls (section 6). Without it, `/book` shows a request form. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Optional | Meta Pixel ID, digits only (section 7). |
| `NEXT_PUBLIC_GA_ID` | Optional | GA4 measurement ID, `G-…` (section 7). |

Good to know:

- Variables starting with `NEXT_PUBLIC_` are built into the pages. After changing one in Vercel, **redeploy** (Deployments → ⋯ → Redeploy) for it to take effect.
- To create a random secret, run this in a terminal and copy the output:

  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

---

## 2. Form submissions: Google Sheet + email alerts

Every form on the site (registrations, waitlists, applications, corporate enquiries, contact messages, assessment results, booking requests, orders and payments) is sent as JSON to `LEADS_WEBHOOK_URL`:

```json
{
  "secret": "your LEADS_WEBHOOK_SECRET",
  "type": "contact",
  "receivedAt": "2026-10-05T08:30:00.000Z",
  "data": { "name": "…", "email": "…", "message": "…" }
}
```

The recommended setup is a Google Sheet with a small Apps Script that adds one row per submission (one tab per type) and emails the coach. It's free and needs no other accounts.

### 2.1 Create the sheet and the script

1. Signed in to the Google account that should own the leads, create a new Google Sheet, e.g. **"The Power Shift: leads"**.
2. In the sheet, open **Extensions → Apps Script**. Delete the sample code in `Code.gs` and paste the script below.
3. Change `NOTIFY_EMAIL` if alerts should go to a different address.
4. Click **Project Settings** (gear icon) → **Script Properties** → **Add script property**:
   - Property: `LEADS_WEBHOOK_SECRET`
   - Value: the same random string you'll use for `LEADS_WEBHOOK_SECRET` on the site.
5. Click **Save project**.

```js
/**
 * The Power Shift: website form submissions → Google Sheet + email alert.
 *
 * Each request body is JSON: { secret, type, receivedAt, data }.
 * - Rejects requests without the shared secret (Script Property LEADS_WEBHOOK_SECRET).
 * - Adds one row per submission to a tab named after the type
 *   (registration, application, enquiry, contact, assessment, order, payment, ...).
 *   Nested data is flattened ("customer.name"); new fields get new columns.
 * - Emails NOTIFY_EMAIL about each submission.
 */

const NOTIFY_EMAIL = 'ambitions2021@gmail.com';
const SITE_NAME = 'The Power Shift';
const TIMEZONE = 'Asia/Kolkata';
// Remove a type from this list to stop email alerts for it (rows are still saved).
const NOTIFY_TYPES = [
  'registration', 'waitlist', 'application', 'enquiry', 'contact',
  'assessment', 'booking-request', 'order', 'payment',
];

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond_({ ok: false, error: 'Invalid JSON' });
  }

  const secret = PropertiesService.getScriptProperties().getProperty('LEADS_WEBHOOK_SECRET');
  if (!secret || body.secret !== secret) {
    return respond_({ ok: false, error: 'Unauthorised' });
  }

  const type = String(body.type || 'other').replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'other';
  const received = body.receivedAt ? new Date(body.receivedAt) : new Date();
  const record = Object.assign(
    { receivedAt: Utilities.formatDate(received, TIMEZONE, 'yyyy-MM-dd HH:mm:ss') },
    flatten_(body.data || {})
  );

  // Two submissions arriving together must not write to the same row.
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    appendRecord_(sheetFor_(type), record);
  } finally {
    lock.releaseLock();
  }

  if (NOTIFY_TYPES.indexOf(type) !== -1) {
    try {
      notify_(type, record);
    } catch (err) {
      console.error('Email alert failed', err); // The row is already saved.
    }
  }

  return respond_({ ok: true });
}

function sheetFor_(type) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(type) || ss.insertSheet(type);
}

/** Appends the record under matching headers, adding columns for new fields. */
function appendRecord_(sheet, record) {
  const lastColumn = sheet.getLastColumn();
  let headers = lastColumn > 0
    ? sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(String)
    : [];

  const newKeys = Object.keys(record).filter((key) => headers.indexOf(key) === -1);
  if (newKeys.length) {
    sheet.getRange(1, headers.length + 1, 1, newKeys.length).setValues([newKeys]).setFontWeight('bold');
    headers = headers.concat(newKeys);
    sheet.setFrozenRows(1);
  }

  sheet.appendRow(headers.map((header) => cell_(record[header])));
}

/** { customer: { name: 'A' }, items: [...] } → { 'customer.name': 'A', items: '...' } */
function flatten_(value, prefix, out) {
  out = out || {};
  Object.keys(value).forEach((key) => {
    const name = prefix ? prefix + '.' + key : key;
    const v = value[key];
    if (v === null || v === undefined) {
      out[name] = '';
    } else if (Array.isArray(v)) {
      const simple = v.every((item) => item === null || typeof item !== 'object');
      out[name] = simple ? v.join(', ') : JSON.stringify(v);
    } else if (typeof v === 'object') {
      flatten_(v, name, out);
    } else {
      out[name] = v;
    }
  });
  return out;
}

/**
 * Keeps text as text: phone numbers like +9198... stay intact, and anything
 * starting with = + - @ can't run as a spreadsheet formula.
 */
function cell_(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'string' && /^[=+\-@]/.test(v)) return "'" + v;
  return v;
}

function notify_(type, record) {
  const name = record.name || record['customer.name'] || '';
  const subject = '[' + SITE_NAME + '] New ' + type.replace(/-/g, ' ') + (name ? ': ' + name : '');
  const lines = Object.keys(record)
    .filter((key) => record[key] !== '')
    .map((key) => key + ': ' + record[key]);
  const body = lines.join('\n') +
    '\n\nAll submissions: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl();

  const options = {};
  const email = String(record.email || record['customer.email'] || '');
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) options.replyTo = email; // "Reply" goes to the person

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body, options);
}

function respond_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Run this from the editor to test the setup (and grant permissions the first time). */
function testSetup() {
  const secret = PropertiesService.getScriptProperties().getProperty('LEADS_WEBHOOK_SECRET');
  const e = {
    postData: {
      contents: JSON.stringify({
        secret: secret,
        type: 'contact',
        receivedAt: new Date().toISOString(),
        data: {
          name: 'Setup test',
          email: 'test@example.com',
          phone: '+919876543210',
          topic: 'Something else',
          message: 'If this row and the email alert arrived, the webhook works.',
        },
      }),
    },
  };
  Logger.log(doPost(e).getContent());
}
```

### 2.2 Test inside Apps Script

1. In the editor, choose `testSetup` in the function dropdown and click **Run**.
2. Google asks for permission the first time (to edit the spreadsheet and send email as you). Click **Review permissions**, choose the account, then **Advanced → Go to (project name)** → **Allow**. This warning appears because the script is your own and unverified; that's expected.
3. The execution log should show `{"ok":true}`, a **contact** tab should appear in the sheet with one row, and an alert email should arrive at `NOTIFY_EMAIL`.

If the log shows `{"ok":false,"error":"Unauthorised"}`, the Script Property is missing or misspelt.

### 2.3 Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Description: `Website leads`. **Execute as: Me**. **Who has access: Anyone**.
   (Anyone can reach the URL, but only requests carrying your secret are saved.)
4. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).
5. Set it as `LEADS_WEBHOOK_URL`, and the same secret as `LEADS_WEBHOOK_SECRET`, in `.env.local` and in Vercel.

**Changing the script later:** saving the code doesn't update the live web app. Go to **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The URL stays the same.

### 2.4 Test the whole path

From a terminal (replace both values; don't add `-X POST`, so curl follows Google's redirect correctly):

```bash
curl -L -H "Content-Type: application/json" \
  -d '{"secret":"YOUR_SECRET","type":"contact","receivedAt":"2026-10-05T08:30:00Z","data":{"name":"Curl test","email":"test@example.com","message":"Hello from curl"}}' \
  "https://script.google.com/macros/s/XXXX/exec"
```

You should get `{"ok":true}` and a new row. Then restart `npm run dev` with the variables in `.env.local`, send the form at `/contact`, and check that a row and an email arrive.

> **Important:** Apps Script always answers with HTTP 200, even when it rejects a request, so a wrong secret or URL means rows silently stop appearing. Re-test after every change to the secret, the script or the deployment, and keep an eye on the sheet after launch.

Limits: Google caps how many emails a script can send per day (a free Gmail account gets far fewer than a Google Workspace account). If you run large events, remove `registration` from `NOTIFY_TYPES` and check the sheet instead.

---

## 3. Razorpay payments

Online payments use Razorpay Orders + Checkout. The server creates every order from the prices in `src/content/`, so amounts can't be changed in the browser.

### 3.1 Test mode

1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com) and switch to **Test Mode** (toggle at the top).
2. Go to **Account & Settings → API Keys → Generate Key**. Copy the **Key ID** (`rzp_test_…`) and the **Key Secret** (shown only once).
3. Put them in `.env.local` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` and restart `npm run dev`.
4. Make a test payment: register for the paid workshop at `/leadership-workshop`, or add merch to the cart and check out.
   - **UPI:** enter `success@razorpay` for a successful payment, or `failure@razorpay` to see a failure.
   - **Cards:** use a test card from Razorpay's [test card details](https://razorpay.com/docs/payments/payments/test-card-details/) page, any future expiry date and any CVV.
5. After a successful payment you land on the thank-you or order-success page, and a **payment** row appears in the sheet (`source: checkout`).

### 3.2 Webhook

The webhook is the safety net when someone pays and closes the tab before the browser confirms it. Razorpay can't reach `localhost`, so set it up once the site is deployed (a Vercel preview URL is fine for test mode).

1. **Account & Settings → Webhooks → Add New Webhook**.
2. **Webhook URL:** `https://itzmanisha.com/api/payments/webhook` (or your preview URL + `/api/payments/webhook`).
3. **Secret:** a new random string. Put the same value in `RAZORPAY_WEBHOOK_SECRET`.
4. **Active events:** `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`.
5. Save, then make a test payment: a **payment** row with `source: webhook` should appear.

Test mode and live mode have **separate** webhooks. Create it again after switching to live mode.

### 3.3 Activation (KYC) and live keys

1. In the dashboard, complete **Activation**: business type, PAN, bank account, address proof and GSTIN if registered.
2. Razorpay reviews the website. Before you submit, make sure these pages are live and show the real business details (set `site.legal` in `src/content/site.ts`):
   - Contact: `https://itzmanisha.com/contact` (needs the business address)
   - Terms & conditions: `/terms`
   - Privacy policy: `/privacy-policy`
   - Refund & cancellation policy: `/refund-policy`
   - Shipping & delivery policy: `/shipping-policy`
   - Prices on the program and merch pages
3. Once activated, switch to **Live Mode → Account & Settings → API Keys → Generate Key**.
4. In Vercel (Production environment), replace `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` with the live keys, create the live webhook (3.2) and put its secret in `RAZORPAY_WEBHOOK_SECRET`. Redeploy.
5. Make one small real payment, check the sheet rows (checkout and webhook), then refund it from **Transactions → Payments → Refund** and check that a `refund.processed` row arrives.

---

## 4. Hosted payment link fallback

While the Razorpay API keys are not set, the site still takes payments:

- **Paid programs** send people to the program's `paymentLink` in `src/content/programs.ts` (currently the existing Razorpay Payment Page for the leadership workshop).
- **Merch** switches to ordering on WhatsApp.

If you rely on the payment link:

- Keep the amount on the Razorpay Payment Page the same as `price.amount` in `programs.ts`. The site can't check it.
- The Payment Page must collect name, email and phone itself. Those payments don't carry the site's order reference, so match them to registrations in the Razorpay dashboard.
- Payments through the link still reach the webhook (section 3.2) if it's configured on the same Razorpay account.

Once API keys are set, the link is no longer used.

---

## 5. WhatsApp community link

Joining links and session updates are shared in the WhatsApp community.

1. In WhatsApp: **Communities → your community → Invite members via link → Copy link** (`https://chat.whatsapp.com/…`).
2. Set it as `NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL` and redeploy.

It appears after registration (thank-you page and confirmation), in calendar invites and in the footer. Until it's set, those buttons say "Ask to join the WhatsApp community" and open a chat with the business number instead.

---

## 6. Booking link (Calendly or Cal.com)

1. Create an event type for clarity calls in [Calendly](https://calendly.com) or [Cal.com](https://cal.com), with the questions you want answered before the call.
2. Copy its public link (e.g. `https://calendly.com/<name>/clarity-call`) into `NEXT_PUBLIC_BOOKING_URL` and redeploy.

`/book` then embeds the scheduler (with a direct link as a backup), and the coaching application form offers it too. With Calendly, completed bookings are also counted as a `Schedule` conversion. Without a booking link, `/book` shows a request form that saves a **booking-request** row instead.

The privacy policy names the scheduling service automatically when the link is set.

---

## 7. Meta Pixel and Google Analytics 4

Both are optional and load only when their ID is set. When an ID is set, the privacy policy automatically describes it. Update `site.legal.lastUpdated` when you switch either on, and ask your lawyer whether you need a cookie-consent prompt first.

### Meta Pixel

1. **Meta Events Manager → Connect data sources → Web → Meta Pixel**. Name it and copy the **Pixel ID** (digits only).
2. Set `NEXT_PUBLIC_META_PIXEL_ID` and redeploy.
3. Check it with **Events Manager → Test events**, or the Meta Pixel Helper browser extension.

The site sends `PageView` on every page (including in-app navigation), plus these conversion events: `Lead`, `CompleteRegistration`, `InitiateCheckout`, `AddToCart`, `Purchase`, `Contact`, `Schedule`, and the custom events `AssessmentStarted` and `AssessmentCompleted`. Use `CompleteRegistration` and `Purchase` to optimise ad campaigns.

### Google Analytics 4

1. **GA4 Admin → Data streams → Add stream → Web**, enter the site URL, and copy the **Measurement ID** (`G-…`).
2. In the stream settings, keep **Enhanced measurement** on, including **Page changes based on browser history events**. The site relies on it to count page views after the first one.
3. Set `NEXT_PUBLIC_GA_ID` and redeploy.
4. Check **Reports → Realtime** while you click around the site, then mark `Lead`, `CompleteRegistration` and `Purchase` as key events under **Admin → Events**.

---

## Deploying on Vercel

### First deployment

1. Push the repository to GitHub (or GitLab / Bitbucket).
2. In [Vercel](https://vercel.com): **Add New → Project → Import** the repository. The Next.js preset needs no changes.
3. Before the first deploy, add the environment variables (section 1). Set `NEXT_PUBLIC_SITE_URL=https://itzmanisha.com` for Production.
4. Deploy and test everything on the `*.vercel.app` address: every form, a test payment, the assessment, and `/sitemap.xml`.

### Moving itzmanisha.com from WordPress

Do this when the new site is tested. Keep the WordPress hosting running until the switch is complete.

1. **Back up WordPress** (Tools → Export, plus your host's backup) and note any old pages that are still linked from ads, WhatsApp messages or bios. The WordPress sitemap (`/wp-sitemap.xml` or `/sitemap_index.xml`) lists them.
2. **Check the redirects.** `next.config.ts` already sends `/manisha-masterclass`, `/manishalp`, `/manishalp-1`, `/thankyou`, `/thankyou-diamond` and `/home` to their new pages, and `/privacy-policy` keeps its address. Add a line to `redirects()` for any other old URL you want to keep working. Trailing slashes from WordPress links are handled automatically.
3. **Add the domain in Vercel:** Project → **Settings → Domains** → add `itzmanisha.com` and `www.itzmanisha.com`. Choose one as primary; Vercel redirects the other to it.
4. **Update DNS** where the domain is managed (your registrar, or your WordPress host if it manages DNS). Vercel shows the exact records to add, usually an **A** record for `itzmanisha.com` and a **CNAME** for `www`. Replace the old A/CNAME records that point to WordPress. **Don't delete MX or TXT records**: they keep email and site verifications (e.g. Google Search Console) working. Lowering the TTL a day before makes the switch faster.
5. Wait for Vercel to show the domain as **Valid** (SSL is issued automatically). Changes usually spread within an hour, sometimes up to 48 hours.
6. **After the switch:**
   - Visit a few old URLs and confirm they redirect.
   - In Google Search Console, submit `https://itzmanisha.com/sitemap.xml`.
   - Set the Razorpay webhook URL to the live domain (section 3.2) and update the website URL in Razorpay if it changed.
   - Update ad and bio links to the new addresses (old ones keep redirecting, but direct links are faster).
   - Cancel the WordPress hosting once everything has run smoothly for a few weeks.

## Student accounts (course sign-in)

The course area (`/account`, `/courses`) supports two modes:

- **Demo (default).** No setup. Accounts live only in the visitor's browser, nothing syncs between devices, and the sign-in pages say so. Fine for showing the client; not for real students.
- **Real accounts on Supabase.** Email + password sign-in, password reset by email, and enrollments and lesson progress stored in Postgres so students can log in from any device.

To switch to real accounts:

1. Create a project at [supabase.com](https://supabase.com) (the free tier is enough to start). Choose the Mumbai region for Indian students.
2. In **SQL Editor**, run `supabase/migrations/0001_student_accounts.sql`. It creates `profiles`, `enrollments` and `lesson_progress` with Row Level Security: students can only read their own rows, and only the website's server can grant course access.
3. In **Authentication → URL Configuration**, set the Site URL to `https://itzmanisha.com` and add `https://itzmanisha.com/account` and `https://itzmanisha.com/account/update-password` to the redirect URLs (add the `http://localhost:3000` equivalents for local testing).
4. Optional but recommended: in **Authentication → Emails**, set up custom SMTP (e.g. Resend or Zoho) so confirmation and reset emails come from your domain; Supabase's built-in sender is rate-limited.
5. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API) in your host and redeploy. The demo notices disappear and "Forgot your password?" starts working.

How course access is granted: when a signed-in student pays with Razorpay, their user id is attached to the order; `/api/payments/verify` (and the webhook, as a backstop) checks the payment signature and only then writes the enrollment with the service-role key. In demo checkout (mock courses while Razorpay isn't configured) `/api/courses/enroll` grants access because nothing is charged. Accounts created in demo mode don't carry over.
