import { BookingStatusView } from "@/components/modules/booking";

// Customer contact details and payment amounts must never be indexed (JIKU-58).
export const metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function ReservationStatusPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}>) {
  const { id } = await params;
  const { token } = await searchParams;
  return <BookingStatusView id={id} token={token ?? ""} />;
}
