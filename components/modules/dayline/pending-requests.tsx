"use client";

import { useEffect, useState } from "react";
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
 * Demandes de rendez-vous en attente de confirmation (mode « sur demande », JIKU-88).
 * Une demande bloque son créneau tant qu'aucun poste n'a décidé ; la confirmer émet
 * le billet (la personne rejoint la ligne), la refuser libère la case. La liste
 * initiale vient du serveur ; elle est ensuite actualisée car plusieurs comptoirs
 * peuvent agir sur la même file.
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
    toast.success(verb === "accept" ? "Rendez-vous confirmé." : "Demande refusée.");
    await refresh();
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Demandes en attente</CardTitle>
        <CardDescription>
          Rendez-vous demandés en mode sur demande, en attente de votre décision.
        </CardDescription>
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
              <EmptyTitle>Aucune demande</EmptyTitle>
              <EmptyDescription>
                Aucune demande de rendez-vous en attente.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            {requests.map((request) => (
              <li key={request.id} className="rounded-lg border bg-background/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {request.clientName ?? "Client"} · {request.clientPhone ?? "sans téléphone"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatSlot(request.startsAt, timezone)} — en attente de confirmation
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === request.id}
                      onClick={() => decide(request.id, "reject")}
                    >
                      Refuser
                    </Button>
                    <Button
                      size="sm"
                      disabled={busyId === request.id}
                      onClick={() => decide(request.id, "accept")}
                    >
                      Confirmer
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

function formatSlot(startIso: string, timezone: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: timezone || "UTC",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startIso));
}
