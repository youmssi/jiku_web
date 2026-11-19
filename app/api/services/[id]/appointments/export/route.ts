import { serverFetch } from "@/lib/api-server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Streams a service's appointments over a period as CSV, with the clients'
 * answers (JIKU-191). The export needs the organizer's bearer token, kept in an
 * httpOnly cookie a plain link cannot carry, so this same-origin handler attaches
 * it and forwards the file. The service id and dates are checked before use.
 */
export async function GET(request: Request, { params }: RouteContext): Promise<Response> {
  const { id } = await params;
  const search = new URL(request.url).searchParams;
  const from = search.get("from") ?? "";
  const to = search.get("to") ?? "";
  if (!UUID.test(id) || !DATE.test(from) || !DATE.test(to)) return new Response(null, { status: 400 });

  const response = await serverFetch(`/services/${id}/appointments/export?from=${from}&to=${to}`);
  if (!response.ok || !response.body) {
    return new Response("Unable to export the appointments.", { status: response.status || 502 });
  }
  return new Response(response.body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": response.headers.get("content-disposition") ?? `attachment; filename="appointments-${from}-${to}.csv"`,
    },
  });
}
