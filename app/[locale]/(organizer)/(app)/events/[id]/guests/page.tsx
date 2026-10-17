import { GuestsView } from "@/components/modules/guest/server";

export default async function EventGuestsPage({
  params,
  searchParams,
}: Readonly<{ params: Promise<{ id: string }>; searchParams: Promise<{ answer?: string }> }>) {
  const [{ id }, { answer }] = await Promise.all([params, searchParams]);
  return <GuestsView eventId={id} answer={answer} />;
}
