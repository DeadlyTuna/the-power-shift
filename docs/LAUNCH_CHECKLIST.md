# Launch checklist

Everything to replace, confirm or test before itzmanisha.com goes live on the new site. Each item says where to make the change. Setup steps are in [SETUP.md](SETUP.md).

Search the code for `TODO` to find every placeholder the list below refers to.

## 1. Content and media

- [ ] **Portrait and photos.** Add a real portrait (4:5 works best) to `public/images/` and set `site.media.portrait` in `src/content/site.ts`. Until then, pages use a typographic treatment instead of a photo.
- [ ] **Mission video.** Add the 14-second mission clip from the current site (and a poster image) and set `site.media.missionVideo` and `site.media.missionVideoPoster`.
- [ ] **Merch catalog.** `src/content/merch.ts` is a **sample** catalog. Replace the products, descriptions and prices with the real range, add real product photos (`image`), and set `merchIsSample = false`.
- [ ] **Shipping rules.** Confirm the flat fee, free-shipping threshold, dispatch time and delivery time in `shipping` (`src/content/merch.ts`). The shipping policy and checkout both read from it.
- [ ] **Next event dates.** The masterclass and workshop dates in `src/content/programs.ts` (`event.startsAt`) are from the old site and have passed, so both events currently show a waitlist. Set the next real dates.
- [ ] **Masterclass duration.** `durationMinutes: 90` for the Be Heard masterclass is unconfirmed (the old page didn't state one). Confirm or correct it.
- [ ] **Capacity and seats.** Confirm the masterclass capacity (100). Only ever set `seatsTaken` to the real registration count, or leave it out.
- [ ] **Workshop price and payment link.** Confirm the workshop price (`price.amount`) and that `paymentLink` still points to the right Razorpay Payment Page with the same amount.
- [ ] **Assessment reframes.** Manisha to review every statement, limiting script and reframe ("shift"), the four patterns, the practices and the result bands in `src/content/assessment.ts`.
- [ ] **Credentials.** Confirm everything in `credentials` and the About page copy (years, countries, education, "award-winning": name the award if possible, "agile coach at Aptiv").
- [ ] **Testimonials.** Confirm that Ruchi Bansal, Ashwini Shenoy and Mayukhi Sen are happy for their names and words to appear on the new site.
- [ ] **Program details.** Read through every program in `programs.ts`: outcomes, formats, agenda, FAQs (several FAQ answers were drafted because the old site only had the questions).

## 2. Contact details and links

- [ ] **Contact details and hours** in `site.contact` (phone, email, WhatsApp number, hours).
- [ ] **WhatsApp community link** → `NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL` ([SETUP §5](SETUP.md#5-whatsapp-community-link)).
- [ ] **Booking link** (Calendly or Cal.com) → `NEXT_PUBLIC_BOOKING_URL`, or decide to use the request form ([SETUP §6](SETUP.md#6-booking-link-calendly-or-calcom)).
- [ ] **Social profiles** in `site.social` (LinkedIn, Instagram, YouTube, Facebook). Empty ones are hidden.

## 3. Legal and business details

- [ ] **Business details** in `site.legal`: legal entity name, **registered business address** (Razorpay requires it on the Contact page; it's hidden while empty), city, **GSTIN** if registered, and the court jurisdiction.
- [ ] **Lawyer review** of `/privacy-policy`, `/terms`, `/refund-policy` and `/shipping-policy`. Each page's source has a review note and `TODO(client)` comments for the points to confirm:
  - Grievance Officer (defaults to the business owner) and a response time for privacy requests
  - Retention periods
  - Where form data is stored (Google Sheets) and who hosts the site (Vercel)
  - The courier partner
  - The promise to refund paid sessions that are rescheduled or cancelled
  - Merch: 7-day reporting window, photos, replacement or refund, cancellation before dispatch, shipping refunded on cancelled orders, who pays return postage, re-delivery charges
  - Refund timing (5–7 working days after approval, to the original payment method)
- [ ] **Cookie consent.** Before switching on the Meta Pixel or Google Analytics, decide with your lawyer whether a consent prompt is needed.
- [ ] **Last updated date.** Set `site.legal.lastUpdated` to the date the final policies are published, and change it whenever they change.

## 4. Payments (Razorpay)

- [ ] Account **activated** (KYC approved) with the live website and policy pages ([SETUP §3.3](SETUP.md#33-activation-kyc-and-live-keys)).
- [ ] **Live keys** in Vercel Production: `RAZORPAY_KEY_ID` (`rzp_live_…`) and `RAZORPAY_KEY_SECRET`.
- [ ] **Live webhook** at `https://itzmanisha.com/api/payments/webhook` with `payment.captured`, `payment.failed`, `order.paid`, `refund.processed`, and its secret in `RAZORPAY_WEBHOOK_SECRET`.
- [ ] One **real payment and refund** made end to end, with rows from checkout, webhook and refund in the sheet.

## 5. Form submissions

- [ ] Google Sheet + Apps Script deployed as a web app ([SETUP §2](SETUP.md#2-form-submissions-google-sheet--email-alerts)).
- [ ] `LEADS_WEBHOOK_URL` and `LEADS_WEBHOOK_SECRET` set in Vercel Production, and the same secret in the script's properties.
- [ ] `testSetup` and the curl test both add a row and send an alert email.

## 6. Analytics (optional)

- [ ] `NEXT_PUBLIC_META_PIXEL_ID` set and checked in Events Manager → Test events.
- [ ] `NEXT_PUBLIC_GA_ID` set, Enhanced measurement on (including browser history page changes), key events marked.
- [ ] After switching analytics on, `site.legal.lastUpdated` updated (the privacy policy text updates itself).

## 7. Test every form end to end

On the live domain, on a phone. For each one, check: the confirmation screen, a row in the right sheet tab, the alert email, and (if analytics is on) the conversion event.

- [ ] Masterclass registration (`/masterclass`) → `registration`
- [ ] Leadership workshop: registration and payment (`/leadership-workshop`) → `registration` + `payment`
- [ ] Waitlist for an event whose date has passed → `waitlist`
- [ ] Coaching applications (`/programs/one-to-one-coaching`, `/programs/mindset-mastery`) → `application`
- [ ] Corporate enquiry (`/corporate`) → `enquiry`
- [ ] Clarity call: booking embed, or the request form (`/book`) → `booking-request`
- [ ] Contact form (`/contact`) → `contact`
- [ ] Assessment "email me my results" (`/assessment`) → `assessment`
- [ ] Merch order with payment (`/merch` → cart → checkout) → `order` + `payment`
- [ ] A failed payment (`failure@razorpay` in test mode) shows a clear message and lets the person try again

## 8. Domain, SEO and final checks

- [ ] `NEXT_PUBLIC_SITE_URL=https://itzmanisha.com` in Vercel Production.
- [ ] Domain moved from WordPress, DNS valid, HTTPS working, `www` redirects to the main domain ([SETUP: Deploying on Vercel](SETUP.md#deploying-on-vercel)).
- [ ] Old URLs redirect: `/manisha-masterclass`, `/manishalp`, `/manishalp-1`, `/thankyou`, `/thankyou-diamond`, `/home`, plus any others still used in ads or messages.
- [ ] `https://itzmanisha.com/sitemap.xml` submitted in Google Search Console; `robots.txt` reachable.
- [ ] Link previews: paste the home page and a few inner pages into WhatsApp and Facebook's Sharing Debugger. Each should show the right title, description and the social image.
- [ ] Meta ad and Instagram/WhatsApp bio links point at the new pages.
- [ ] A quick pass on a real phone: every page loads, no sideways scrolling, buttons easy to tap, the WhatsApp button works.
