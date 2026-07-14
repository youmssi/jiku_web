import { redirect } from "next/navigation";
import { PaymentsView } from "@/components/modules/admin";
import type { AdminPayment } from "@/components/modules/admin";
import { adminFetch } from "@/lib/api-server";
import { ADMIN_ROUTES } from "@/lib/constants";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const params = new URLSearchParams({ size: "50", status: status ?? "PENDING" });

  const response = await adminFetch(`/admin/payments?${params.toString()}`);
  if (response.status === 401 || response.status === 403) {
    redirect(ADMIN_ROUTES.LOGIN);
  }
  const payments = (await response.json()) as AdminPayment[];

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">Payments desk</h1>
      <PaymentsView payments={payments} />
    </div>
  );
}
