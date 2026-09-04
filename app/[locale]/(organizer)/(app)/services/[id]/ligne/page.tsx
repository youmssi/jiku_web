import { DayLineOrganizerView } from "@/components/modules/dayline";

export default async function ServiceDayLinePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <DayLineOrganizerView serviceId={id} />;
}
