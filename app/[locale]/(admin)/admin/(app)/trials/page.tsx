import { AdminPage, TrialsView } from "@/components/modules/admin";
import { loadTrials } from "@/components/modules/admin/server";

export default async function AdminTrialsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ page?: string }> }>) {
  const { page } = await searchParams;
  const { trialsPage, stats, catalog } = await loadTrials(Math.max(0, Number.parseInt(page ?? "0", 10) || 0));
  return (
    <AdminPage title="Trials">
      <TrialsView trialsPage={trialsPage} stats={stats} catalog={catalog} />
    </AdminPage>
  );
}
