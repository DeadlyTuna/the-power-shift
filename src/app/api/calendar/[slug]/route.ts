import { getProgram } from "@/content/programs";
import { buildIcs } from "@/components/enroll/calendar";
import { apiError } from "@/lib/http";

/**
 * GET /api/calendar/[slug]
 * Downloads an .ics file for a live event (RFC 5545: CRLF line endings,
 * lines folded at 75 octets, UTC times). Contains program details only.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = getProgram(slug);
  const ics = program ? buildIcs(program) : null;

  if (!program || !ics) {
    return apiError(404, "There's no calendar file for this program. Check the link and try again.");
  }

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${program.slug}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
