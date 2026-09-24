import { AdminPage, BookingsView } from "@/components/modules/admin";
import { loadBookings } from "@/components/modules/admin/server";

export default async function AdminBookingsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ status?: string }> }>) {
  const { status } = await searchParams;
  return (
    <AdminPage title="Réservations">
      <BookingsView bookings={await loadBookings(status)} />
    </AdminPage>
  );
}
