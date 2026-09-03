import { serverFetch } from "@/lib/api-server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * Streams an invoice PDF to the browser as a download (JIKU-69). The invoice
 * endpoint needs the organizer's bearer token from an httpOnly cookie that a
 * plain link cannot reach, so this same-origin handler attaches it via
 * `serverFetch`.
 *
 * The filename comes from the backend's Content-Disposition, so the saved file
 * carries the invoice number that identifies it in an accounts department.
 */
export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  const { id } = await params;
  const response = await serverFetch(`/billing/invoices/${id}/document`);

  if (!response.ok || !response.body) {
    return new Response("Unable to download the invoice.", { status: response.status || 502 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        response.headers.get("Content-Disposition") ?? `attachment; filename="invoice-${id}.pdf"`,
    },
  });
}
