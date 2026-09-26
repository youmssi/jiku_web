import { AdminPage, PaymentsView } from "@/components/modules/admin";
import { loadPayments } from "@/components/modules/admin/server";

export default async function AdminPaymentsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ status?: string }> }>) {
  const { status } = await searchParams;
  return (
    <AdminPage title="Payments desk">
      <PaymentsView payments={await loadPayments(status)} />
    </AdminPage>
  );
}
