import { redirect } from "next/navigation";
import { BookingsView } from "@/components/modules/admin";
import type { AdminBooking } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminBookingsPage({ searchParams }: Readonly<PageProps>) {
  const { status } = await searchParams;
  const params = new URLSearchParams({ size: "50", status: status ?? "AWAITING_DEPOSIT" });

  const response = await adminFetch(`/admin/bookings?${params.toString()}`);
  if (response.status === 401 || response.status === 403) {
    redirect(ADMIN_ROUTES.LOGIN);
  }
  // A non-OK body (unknown status, backend failure) is an object, not a list —
  // parsing it as an array is what crashed the desk. Surface the empty state
  // instead; the status filter buttons stay usable to recover.
  const bookings = response.ok
    ? ((await response.json()) as AdminBooking[])
    : [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Réservations</h1>
      <BookingsView bookings={bookings} />
    </div>
  );
}
