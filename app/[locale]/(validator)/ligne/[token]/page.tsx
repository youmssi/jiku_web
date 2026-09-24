import { DayLineStaffView } from "@/components/modules/dayline";
import { StateMessage } from "@/components/shared";
import { publicFetch } from "@/lib/api-server";

// The staff day-line link is a credential in the URL: it must never be indexed.
export const metadata = { robots: { index: false, follow: false, nocache: true } };

/** A short code never contains a dot; a signed JWT always does (header.payload.signature). */
function isShortCode(value: string): boolean {
  return !value.includes(".");
}

export default async function DayLineStaffPage({
  params,
}: Readonly<{ params: Promise<{ token: string }> }>) {
  const { token: raw } = await params;

  if (!isShortCode(raw)) {
    return <DayLineStaffView token={raw} />;
  }

  // Short links (JIKU-88) are resolved into a fresh signed token here, once,
  // server-side — the console itself and every call it makes afterward stay
  // entirely unaware a short code was ever involved.
  const response = await publicFetch(`/line-codes/${raw}`);
  if (!response.ok) {
    return (
      <StateMessage
        title="Ce lien de comptoir n'est plus valide"
        description="Il a peut-être été révoqué. Demandez-en un nouveau à l'organisateur."
      />
    );
  }
  const { token } = (await response.json()) as { token: string };
  return <DayLineStaffView token={token} />;
}
