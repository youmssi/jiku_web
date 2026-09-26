"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Inbox } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  acceptPendingRequestAction,
  fetchPendingRequestsAction,
  rejectPendingRequestAction,
} from "@/components/modules/dayline/dayline.service";
import type {
  DayLineAuth,
  PendingAppointmentRequest,
} from "@/components/modules/dayline/schema";

const REFRESH_MS = 15_000;

/**
 * Appointment requests waiting for a decision (on-request mode, JIKU-88). A
 * request holds its time until a counter decides: confirming issues the ticket
 * (the person joins the line), declining frees the time. The first list comes
 * from the server, then refreshes, since several counters work the same line.
 */
export function PendingRequests({
  auth,
  timezone,
  initial,
}: {
  auth: DayLineAuth;
  timezone: string;
  initial: PendingAppointmentRequest[];
}) {
  const t = useTranslations("operator.line.requests");
  const format = useFormatter();
  const [requests, setRequests] = useState<PendingAppointmentRequest[]>(initial);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const timer = setInterval(async () => {
      if (document.visibilityState === "hidden") return;
      const result = await fetchPendingRequestsAction(auth);
      if (active && result.ok) setRequests(result.data);
    }, REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [auth]);

  async function refresh() {
    const result = await fetchPendingRequestsAction(auth);
    if (result.ok) {
      setRequests(result.data);
    } else {
      toast.error(result.error);
    }
  }

  async function decide(requestId: string, verb: "accept" | "reject") {
    setBusyId(requestId);
    const action = verb === "accept" ? acceptPendingRequestAction : rejectPendingRequestAction;
    const result = await action(auth, requestId);
    setBusyId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(verb === "accept" ? t("accepted") : t("rejected"));
    await refresh();
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("text")}</CardDescription>
        {requests.length > 0 ? (
          <CardAction>
            <Badge variant="outline">{requests.length}</Badge>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <Empty className="py-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle>{t("emptyTitle")}</EmptyTitle>
              <EmptyDescription>{t("emptyText")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            {requests.map((request) => (
              <li key={request.id} className="rounded-lg border bg-background/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {request.clientName ?? "—"} · {request.clientPhone ?? t("noPhone")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("awaiting", {
                        slot: format.dateTime(new Date(request.startsAt), {
                          timeZone: timezone || "UTC",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === request.id}
                      onClick={() => decide(request.id, "reject")}
                    >
                      {t("reject")}
                    </Button>
                    <Button
                      size="sm"
                      disabled={busyId === request.id}
                      onClick={() => decide(request.id, "accept")}
                    >
                      {t("accept")}
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
