import { DashboardView } from "@/components/modules/dashboard";
import { EventSetup, loadEvent } from "@/components/modules/event/server";

/** The event's overview: its setup checklist while a draft, its live dashboard afterwards. */
export default async function EventOverviewPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const load = await loadEvent(id);
  if (load.kind !== "ok") return null;
  return load.event.status === "DRAFT" ? <EventSetup eventId={id} /> : <DashboardView eventId={id} />;
}
