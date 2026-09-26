import { EventSettingsView } from "@/components/modules/event/server";

export default async function EventSettingsPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <EventSettingsView eventId={id} />;
}
