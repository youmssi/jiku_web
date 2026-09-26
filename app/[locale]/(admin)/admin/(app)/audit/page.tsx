import { getTranslations } from "next-intl/server";
import { AdminPage, AuditView } from "@/components/modules/admin";
import { loadAudit } from "@/components/modules/admin/server";

export default async function AdminAuditPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ action?: string }> }>) {
  const t = await getTranslations("admin.pages");
  const { action } = await searchParams;
  return (
    <AdminPage title={t("audit")}>
      <AuditView audit={await loadAudit(action)} />
    </AdminPage>
  );
}
