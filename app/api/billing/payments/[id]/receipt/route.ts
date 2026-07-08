import { serverFetch } from "@/lib/api-server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Streams a payment receipt to the browser as a download. The receipt endpoint
 * requires the organizer's bearer token from an httpOnly cookie unreachable from a
 * plain link, so this same-origin handler attaches it via `serverFetch`.
 */
export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  const { id } = await params;
  const response = await serverFetch(`/billing/payments/${id}/receipt`);

  if (!response.ok || !response.body) {
    return new Response("Unable to download the receipt.", { status: response.status || 502 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="receipt-${id}.txt"`,
    },
  });
}
