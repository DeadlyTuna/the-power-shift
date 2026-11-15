import "server-only";

/**
 * Where form submissions go.
 *
 * Every registration, application, enquiry, assessment, order and payment is
 * POSTed as JSON to LEADS_WEBHOOK_URL. The recommended target is a Google Apps
 * Script web app that appends rows to a Google Sheet and emails the coach
 * (see docs/SETUP.md), but any webhook works: Zapier, Make, Pabbly, n8n.
 *
 * Payload: { secret, type, receivedAt, data }
 * `secret` is sent in the body because Apps Script cannot read request headers.
 */

export type SubmissionType =
  | "registration"
  | "waitlist"
  | "application"
  | "enquiry"
  | "contact"
  | "assessment"
  | "booking-request"
  | "order"
  | "payment";

export type RecordResult = { ok: true } | { ok: false; reason: "not-configured" | "failed" };

export async function recordSubmission(type: SubmissionType, data: Record<string, unknown>): Promise<RecordResult> {
  const url = process.env.LEADS_WEBHOOK_URL;
  const payload = {
    secret: process.env.LEADS_WEBHOOK_SECRET ?? "",
    type,
    receivedAt: new Date().toISOString(),
    data,
  };

  if (!url) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[leads] ${type} (LEADS_WEBHOOK_URL not set, logging only)`, JSON.stringify(data, null, 2));
      return { ok: true };
    }
    console.error(`[leads] LEADS_WEBHOOK_URL is not set; a ${type} submission could not be saved.`);
    return { ok: false, reason: "not-configured" };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[leads] webhook responded ${res.status} for ${type}`);
      return { ok: false, reason: "failed" };
    }
    // Apps Script always answers 200, even when it rejects a request (e.g. a wrong
    // secret), so a JSON body of { ok: false } must count as a failure too.
    const body = await res.text().catch(() => "");
    try {
      const parsed = JSON.parse(body) as { ok?: unknown };
      if (parsed && typeof parsed === "object" && parsed.ok === false) {
        console.error(`[leads] webhook rejected ${type}: ${body.slice(0, 200)}`);
        return { ok: false, reason: "failed" };
      }
    } catch {
      // Non-JSON 2xx responses (e.g. Zapier's "ok") count as success.
    }
    return { ok: true };
  } catch (err) {
    console.error(`[leads] webhook request failed for ${type}`, err);
    return { ok: false, reason: "failed" };
  }
}

/** Message shown to the visitor when a submission could not be saved. */
export const SAVE_FAILED_MESSAGE =
  "We couldn't save your details just now. Please try again in a minute, or message us on WhatsApp and we'll sort it out.";
