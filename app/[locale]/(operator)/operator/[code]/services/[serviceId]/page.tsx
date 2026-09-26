import { DayLineStaffView } from "@/components/modules/dayline";
import { OperatorBackLink, OperatorLinkInvalid } from "@/components/modules/operator";
import { resolveOperatorCode } from "@/components/modules/operator/server";

export const metadata = { robots: { index: false, follow: false, nocache: true } };

/** A service's day line, opened from an operator's link (JIKU-116). */
export default async function OperatorServicePage({
  params,
}: Readonly<{ params: Promise<{ code: string; serviceId: string }> }>) {
  const { code, serviceId } = await params;
  const token = await resolveOperatorCode(code);
  if (!token) return <OperatorLinkInvalid />;
  return (
    <>
      <OperatorBackLink code={code} />
      <DayLineStaffView base={`operator/${encodeURIComponent(token)}/services/${encodeURIComponent(serviceId)}`} />
    </>
  );
}
