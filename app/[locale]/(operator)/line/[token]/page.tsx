import { DayLineStaffView, resolveCounterLinkAction } from "@/components/modules/dayline";
import { StateMessage } from "@/components/shared";

// The counter link is a credential in the URL: it must never be indexed.
export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function CounterLinePage({
  params,
}: Readonly<{ params: Promise<{ token: string }> }>) {
  const { token } = await params;
  const link = await resolveCounterLinkAction(token);
  if (!link.ok) {
    return (
      <StateMessage
        title={link.error}
        description="Il a peut-être été révoqué. Demandez-en un nouveau à l'organisateur."
      />
    );
  }
  return <DayLineStaffView token={link.data} />;
}
