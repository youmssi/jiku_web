import { DashboardView } from "@/components/modules/dashboard";

export default function EventDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  return <DashboardView params={params} />;
}
