import { GuestsView } from "@/components/modules/guest/server";

export default async function EventGuestsPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <GuestsView eventId={id} />;
}
