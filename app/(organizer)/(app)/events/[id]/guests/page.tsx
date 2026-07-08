import { GuestsView } from "@/components/modules/guest";

export default function GuestsPage({ params }: { params: Promise<{ id: string }> }) {
  return <GuestsView params={params} />;
}
