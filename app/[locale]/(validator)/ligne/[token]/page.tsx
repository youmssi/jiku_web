import { DayLineStaffView } from "@/components/modules/dayline";

// The staff day-line link is a credential in the URL: it must never be indexed.
export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function DayLineStaffPage({
  params,
}: Readonly<{ params: Promise<{ token: string }> }>) {
  const { token } = await params;
  return <DayLineStaffView token={token} />;
}
