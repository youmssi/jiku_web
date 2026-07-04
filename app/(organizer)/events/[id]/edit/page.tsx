import { EditEventView } from "@/components/modules/event";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  return <EditEventView params={params} />;
}
