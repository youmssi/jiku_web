import { AdminPage, BookingPaymentsView } from "@/components/modules/admin";
import { loadBookingPayments } from "@/components/modules/admin/server";

export default async function AdminBookingPaymentsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ status?: string }> }>) {
  const { status } = await searchParams;
  return (
    <AdminPage title="Paiements de réservation">
      <BookingPaymentsView declarations={await loadBookingPayments(status)} />
    </AdminPage>
  );
}
