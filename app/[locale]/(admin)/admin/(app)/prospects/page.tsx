import { AdminPage, ProspectsTable } from "@/components/modules/admin";
import { loadProspects } from "@/components/modules/admin/server";

export default async function AdminProspectsPage() {
  return (
    <AdminPage title="Prospects">
      <ProspectsTable prospects={await loadProspects()} />
    </AdminPage>
  );
}
