import { getTranslations } from "next-intl/server";
import { AdminPage, FollowUps } from "@/components/modules/admin";
import { loadFollowUps } from "@/components/modules/admin/server";

export default async function AdminFollowUpsPage() {
  const t = await getTranslations("admin.pages");
  return (
    <AdminPage title={t("followUps")}>
      <FollowUps overview={await loadFollowUps()} />
    </AdminPage>
  );
}
