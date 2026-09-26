import { AdminPage, AgreementsView } from "@/components/modules/admin";
import { loadAgreements } from "@/components/modules/admin/server";

export default async function AdminAgreementsPage() {
  const { agreements, catalog } = await loadAgreements();
  return (
    <AdminPage title="Enterprise agreements">
      <AgreementsView agreements={agreements} catalog={catalog} />
    </AdminPage>
  );
}
