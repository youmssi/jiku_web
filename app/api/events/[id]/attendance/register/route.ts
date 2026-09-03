import { serverFetch } from "@/lib/api-server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Streams the attendance register PDF to the browser as a download (JIKU-95).
 * The endpoint needs the organizer's bearer token from an httpOnly cookie a
 * plain link cannot reach, so this same-origin handler attaches it via
 * `serverFetch` and forwards the stream and its attachment header.
 */
export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  const { id } = await params;
  const response = await serverFetch(`/events/${id}/attendance/register`);

  if (!response.ok || !response.body) {
    return new Response("Impossible de générer la feuille d'émargement.", {
      status: response.status || 502,
    });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        response.headers.get("content-disposition") ?? `attachment; filename="emargement-${id}.pdf"`,
    },
  });
}
