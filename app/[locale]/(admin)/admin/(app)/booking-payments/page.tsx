import { redirect } from "next/navigation";
import { BookingPaymentsView } from "@/components/modules/admin";
import type { AdminBookingPaymentDeclaration } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminBookingPaymentsPage({ searchParams }: Readonly<PageProps>) {
  const { status } = await searchParams;
  const params = new URLSearchParams({ size: "50", status: status ?? "PENDING" });

  const response = await adminFetch(`/admin/booking-payments?${params.toString()}`);
  if (response.status === 401 || response.status === 403) {
    redirect(ADMIN_ROUTES.LOGIN);
  }
  const declarations = (await response.json()) as AdminBookingPaymentDeclaration[];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Paiements de réservation</h1>
      <BookingPaymentsView declarations={declarations} />
    </div>
  );
}
