import { cardCalendar } from "@/components/modules/open-invitation/public-server";

/** The card's event as an .ics file (JIKU-289): Apple Calendar, Outlook and other agendas open it. */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const calendar = await cardCalendar(code);
  if (!calendar) return new Response(null, { status: 404 });
  return new Response(calendar.body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(calendar.fileName)}`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
