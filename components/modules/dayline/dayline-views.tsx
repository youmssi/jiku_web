import { getTranslations } from "next-intl/server";
import { publicFetch, serverFetch } from "@/lib/api-server";
import { DayLineConsole } from "@/components/modules/dayline/day-line-console";
import { PendingRequests } from "@/components/modules/dayline/pending-requests";
import type {
  DayLineView,
  PendingAppointmentRequest,
} from "@/components/modules/dayline/schema";

/**
 * Server entries of the day-line console. The first list is rendered on the
 * server (no empty flash), then the console refreshes it. The organizer is
 * authenticated by their session; staff and operators by the link in the path.
 */
export async function DayLineOrganizerView({ serviceId }: { serviceId: string }) {
  const response = await serverFetch(`/services/${serviceId}/day-line`);
  if (!response.ok) {
    const t = await getTranslations("operator.line.unavailable");
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
        <h2 className="text-xl font-semibold">{t("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {response.status === 404 ? t("notFound") : t("failed")}
        </p>
      </div>
    );
  }
  const view = (await response.json()) as DayLineView;
  const requests = await loadPendingRequests(serverFetch(`/services/${serviceId}/day-line/requests`));
  return (
    <div className="min-h-svh bg-zinc-50 pb-12 dark:bg-zinc-950">
      <DayLineConsole auth={{ kind: "organizer", serviceId }} initial={view} />
      <div className="mx-auto w-full max-w-2xl px-4">
        <PendingRequests auth={{ kind: "organizer", serviceId }} timezone={view.timezone} initial={requests} />
      </div>
    </div>
  );
}

export async function DayLineStaffView({ base }: { base: string }) {
  const response = await publicFetch(`/${base}`);
  if (!response.ok) {
    const t = await getTranslations("operator.line.unavailable");
    return (
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h2 className="text-xl font-semibold text-zinc-100">{t("staffTitle")}</h2>
          <p className="mt-2 text-zinc-400">{response.status === 404 ? t("staffNotFound") : t("failed")}</p>
        </div>
      </div>
    );
  }
  const view = (await response.json()) as DayLineView;
  // A counter link and an operator link are both credentials in the path.
  const requests = await loadPendingRequests(publicFetch(`/${base}/requests`));
  return (
    <div className="min-h-svh bg-zinc-50 pb-12 dark:bg-zinc-950">
      <DayLineConsole auth={{ kind: "staff", base }} initial={view} />
      <div className="mx-auto w-full max-w-2xl px-4">
        <PendingRequests auth={{ kind: "staff", base }} timezone={view.timezone} initial={requests} />
      </div>
    </div>
  );
}

/** Pending requests from the server; an empty list is a healthy state. */
async function loadPendingRequests(request: Promise<Response>): Promise<PendingAppointmentRequest[]> {
  const response = await request;
  return response.ok ? ((await response.json()) as PendingAppointmentRequest[]) : [];
}
