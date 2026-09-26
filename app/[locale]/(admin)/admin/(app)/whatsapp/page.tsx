import { AdminPage, WhatsAppAdmin } from "@/components/modules/admin";
import { loadWhatsApp } from "@/components/modules/admin/server";

export default async function AdminWhatsAppPage() {
  const { pricing, override } = await loadWhatsApp();
  return (
    <AdminPage title="WhatsApp">
      <WhatsAppAdmin pricing={pricing} override={override} />
    </AdminPage>
  );
}
