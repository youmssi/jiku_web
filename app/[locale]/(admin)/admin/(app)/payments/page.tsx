import { getTranslations } from "next-intl/server";
import { AdminPage, PaymentsView } from "@/components/modules/admin";
import { loadPayments } from "@/components/modules/admin/server";

export default async function AdminPaymentsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ status?: string }> }>) {
  const t = await getTranslations("admin.pages");
  const { status } = await searchParams;
  return (
    <AdminPage title={t("payments")}>
      <PaymentsView payments={await loadPayments(status)} />
    </AdminPage>
  );
}
