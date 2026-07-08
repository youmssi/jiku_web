import { CheckinView } from "@/components/modules/checkin";

export default function CheckinPage({ params }: { params: Promise<{ token: string }> }) {
  return <CheckinView params={params} />;
}
