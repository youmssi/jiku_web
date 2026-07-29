import { CheckinView } from "@/components/modules/checkin";

// The guest roster this validator link exposes must never be indexed (JIKU-58).
export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default function CheckinPage({ params }: Readonly<{ params: Promise<{ token: string }> }>) {
  return <CheckinView params={params} />;
}
