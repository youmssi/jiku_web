import { getTranslations } from "next-intl/server";
import { AdminPage, GiftsView } from "@/components/modules/admin";
import { loadGifts } from "@/components/modules/admin/server";

export default async function AdminGiftsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ page?: string }> }>) {
  const t = await getTranslations("admin.pages");
  const { page } = await searchParams;
  const { giftsPage, plans } = await loadGifts(Math.max(0, Number.parseInt(page ?? "0", 10) || 0));
  return (
    <AdminPage title={t("gifts")}>
      <GiftsView giftsPage={giftsPage} plans={plans} />
    </AdminPage>
  );
}
