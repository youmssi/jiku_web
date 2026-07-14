import { CheckinView } from "@/components/modules/checkin";

export default function CheckinPage({ params }: Readonly<{ params: Promise<{ token: string }> }>) {
  return <CheckinView params={params} />;
}
