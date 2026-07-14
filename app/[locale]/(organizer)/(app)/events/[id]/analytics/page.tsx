import { AnalyticsView } from "@/components/modules/analytics";

export default function EventAnalyticsPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  return <AnalyticsView params={params} />;
}
