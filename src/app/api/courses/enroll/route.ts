import { z } from "zod";
import { getProgram } from "@/content/programs";
import { apiError, apiOk, parseBody } from "@/lib/http";
import { paymentsConfigured } from "@/lib/payments/razorpay";
import { isRealAuth } from "@/lib/supabase/env";
import { currentUser, grantEnrollment, supabaseServer } from "@/lib/supabase/server";

/**
 * Called by the course page after checkout, for real (Supabase) accounts.
 *
 * - Already enrolled (e.g. the payment verify route granted access): ok.
 * - Demo checkout of a MOCK course while Razorpay isn't configured: grants
 *   access, because nothing is charged in demo mode anyway.
 * - Anything else: refused. Real payments are granted only by the verify
 *   route / webhook after the payment signature checks out.
 */

const schema = z.object({
  slug: z.string().min(1).max(100),
  reference: z.string().regex(/^[A-Za-z0-9_-]{1,60}$/),
});

export async function POST(request: Request) {
  if (!isRealAuth) return apiError(404, "Student accounts aren't set up on this site yet.");

  const { data, response } = await parseBody(request, schema);
  if (response) return response;

  const user = await currentUser();
  if (!user) return apiError(401, "Sign in to your student account, then try again.");

  const program = getProgram(data.slug);
  if (!program?.course) return apiError(404, "We couldn't find that course.");

  const { data: existing } = await (await supabaseServer())
    .from("enrollments")
    .select("course_slug")
    .eq("user_id", user.id)
    .eq("course_slug", program.slug)
    .maybeSingle();
  if (existing) return apiOk({ enrolled: true });

  const demoCheckout = program.mock && !paymentsConfigured() && data.reference.startsWith("DEMO-");
  if (!demoCheckout) {
    return apiError(402, "We couldn't confirm a payment for this course yet. If you've paid, refresh in a minute or message us on WhatsApp.");
  }

  const saved = await grantEnrollment(user.id, program.slug, data.reference);
  if (!saved) return apiError(503, "Your enrollment couldn't be saved just now. Please try again in a minute.");
  return apiOk({ enrolled: true });
}
