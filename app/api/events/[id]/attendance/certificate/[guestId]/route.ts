import { serverFetch } from "@/lib/api-server";

interface RouteContext {
  params: Promise<{ id: string; guestId: string }>;
}

/**
 * Streams a participant's attendance certificate PDF as a download (JIKU-95),
 * attaching the organizer's bearer token like the register handler beside it.
 *
 * A 409 means the participant was never checked in: the backend refuses to
 * certify a fact that did not happen, and the message says so rather than
 * showing a generic failure.
 */
export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  const { id, guestId } = await params;
  const response = await serverFetch(`/events/${id}/attendance/certificate/${guestId}`);

  if (response.status === 409) {
    return new Response("Ce participant n'a pas été enregistré à l'entrée.", { status: 409 });
  }
  if (!response.ok || !response.body) {
    return new Response("Impossible de générer l'attestation.", { status: response.status || 502 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        response.headers.get("content-disposition") ??
        `attachment; filename="attestation-${guestId}.pdf"`,
    },
  });
}
