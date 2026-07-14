import { GuestsView } from "@/components/modules/guest";

export default function GuestsPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  return <GuestsView params={params} />;
}
