import { CheckinView } from "@/components/modules/checkin";
import { OperatorLinkInvalid } from "@/components/modules/operator";
import { resolveOperatorCode } from "@/components/modules/operator/server";

// The guest roster this door link exposes must never be indexed (JIKU-58).
export const metadata = { robots: { index: false, follow: false, nocache: true } };

/** An event's door by its short link (JIKU-250), the link sent to a validator. */
export default async function DoorPage({ params }: Readonly<{ params: Promise<{ code: string }> }>) {
  const { code } = await params;
  const token = await resolveOperatorCode(code, { door: true });
  if (!token) return <OperatorLinkInvalid />;
  return <CheckinView door={`checkin/${encodeURIComponent(token)}`} />;
}
