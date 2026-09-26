import { CheckinView } from "@/components/modules/checkin";
import { OperatorBackLink, OperatorLinkInvalid } from "@/components/modules/operator";
import { resolveOperatorCode } from "@/components/modules/operator/server";

export const metadata = { robots: { index: false, follow: false, nocache: true } };

/** An event's door, opened from an operator's link (JIKU-116). */
export default async function OperatorEventPage({
  params,
}: Readonly<{ params: Promise<{ code: string; eventId: string }> }>) {
  const { code, eventId } = await params;
  const token = await resolveOperatorCode(code);
  if (!token) return <OperatorLinkInvalid />;
  return (
    <>
      <OperatorBackLink code={code} />
      <CheckinView door={`operator/${encodeURIComponent(token)}/events/${encodeURIComponent(eventId)}`} />
    </>
  );
}
