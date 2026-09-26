import { CheckinView } from "@/components/modules/checkin";

// The guest roster this validator link exposes must never be indexed (JIKU-58).
export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function CheckinPage({ params }: Readonly<{ params: Promise<{ token: string }> }>) {
  const { token } = await params;
  return <CheckinView door={`checkin/${encodeURIComponent(token)}`} />;
}
