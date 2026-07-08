import { serverFetch } from "@/lib/api-server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Streams the backend's guest-list CSV to the browser as a download. The export
 * endpoint requires the organizer's bearer token, which lives in an httpOnly
 * cookie unreachable from a plain link — so this same-origin handler attaches it
 * via `serverFetch` and forwards the streamed response and its attachment headers.
 */
export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  const { id } = await params;
  const response = await serverFetch(`/events/${id}/guests/export`);

  if (!response.ok || !response.body) {
    return new Response("Unable to export the guest list.", { status: response.status || 502 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        response.headers.get("content-disposition") ?? `attachment; filename="guests-${id}.csv"`,
    },
  });
}
