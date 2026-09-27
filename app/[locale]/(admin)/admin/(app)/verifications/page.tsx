import { getTranslations } from "next-intl/server";
import { AdminPage, VerificationsView } from "@/components/modules/admin";
import { loadVerifications } from "@/components/modules/admin/server";

export default async function AdminVerificationsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ status?: string }> }>) {
  const t = await getTranslations("admin.pages");
  const { status } = await searchParams;
  return (
    <AdminPage title={t("verifications")}>
      <VerificationsView requests={await loadVerifications(status)} />
    </AdminPage>
  );
}
