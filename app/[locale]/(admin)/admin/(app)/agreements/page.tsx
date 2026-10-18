import { getTranslations } from "next-intl/server";
import { AdminPage, AgreementsView } from "@/components/modules/admin";
import { loadAgreements } from "@/components/modules/admin/server";

export default async function AdminAgreementsPage() {
  const t = await getTranslations("admin.pages");
  const { agreements, currency } = await loadAgreements();
  return (
    <AdminPage title={t("agreements")}>
      <AgreementsView agreements={agreements} currency={currency} />
    </AdminPage>
  );
}
