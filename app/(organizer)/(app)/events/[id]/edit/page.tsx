import { EditEventView } from "@/components/modules/event";

export default function EditEventPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  return <EditEventView params={params} />;
}
