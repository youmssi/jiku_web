import { redirect } from "next/navigation";
import { eventDashboardRoute } from "@/lib/constants";

/** Analytics was folded into the event overview (Dashboard); keep old links working. */
export default async function EventAnalyticsPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  redirect(eventDashboardRoute(id));
}
