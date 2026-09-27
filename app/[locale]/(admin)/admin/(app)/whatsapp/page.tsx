import { getTranslations } from "next-intl/server";
import { AdminPage, WhatsAppAdmin } from "@/components/modules/admin";
import { loadWhatsApp } from "@/components/modules/admin/server";

export default async function AdminWhatsAppPage() {
  const t = await getTranslations("admin.pages");
  const { pricing, override } = await loadWhatsApp();
  return (
    <AdminPage title={t("whatsapp")}>
      <WhatsAppAdmin pricing={pricing} override={override} />
    </AdminPage>
  );
}
