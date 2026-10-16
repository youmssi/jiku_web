"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Building2, ChevronRight, UserRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneStep } from "./phone-step";
import { RequestForm } from "./request-form";
import type { VerificationKind, VerificationLimits, VerificationOverview, VerificationRequest } from "./schema";

const STATUS_CLASSES = {
  PENDING: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  REJECTED: "bg-destructive/10 text-destructive",
} as const;

/**
 * The organization's verification (référentiel métier §9). It is required
 * before clients can be asked to pay, and recommended to every organization: a
 * verified one is shown as such to its guests. Either a personal verification
 * (identity document and confirmed phone) or a company one (registration
 * papers) is enough, so the organizer first says which one fits them and only
 * that path is shown; a request already sent opens on its own path.
 */
export function VerificationView({ overview }: { overview: VerificationOverview | null }) {
  const t = useTranslations("settings.verification");
  const [chosen, setChosen] = useState<VerificationKind | null>(null);
  if (!overview) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{t("errors.loadFailed")}</AlertDescription>
      </Alert>
    );
  }
  const approvedKind =
    overview.company?.status === "APPROVED" ? "company" : overview.personal?.status === "APPROVED" ? "personal" : null;
  const requested: VerificationKind | null = overview.company ? "company" : overview.personal ? "personal" : null;
  const path = chosen ?? requested;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold">{t("title")}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("text")}</p>
      </div>

      {approvedKind ? (
        <Alert>
          <AlertTitle>{t(approvedKind === "company" ? "status.verifiedCompany" : "status.verifiedPersonal")}</AlertTitle>
          <AlertDescription>{t("status.verifiedText")}</AlertDescription>
        </Alert>
      ) : null}

      {path === null ? (
        <ItemGroup className="gap-2">
          {(["personal", "company"] as const).map((kind) => (
            <Item key={kind} variant="outline" asChild>
              <button type="button" onClick={() => setChosen(kind)} className="text-left">
                <ItemMedia variant="icon">{kind === "personal" ? <UserRound /> : <Building2 />}</ItemMedia>
                <ItemContent>
                  <ItemTitle>{t(`${kind}.choice`)}</ItemTitle>
                  <ItemDescription className="line-clamp-none">{t(`${kind}.text`)}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ChevronRight className="size-4" aria-hidden />
                </ItemActions>
              </button>
            </Item>
          ))}
        </ItemGroup>
      ) : (
        <>
          {path === "personal" && !approvedKind ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("phone.title")}</CardTitle>
                <CardDescription>{t("phone.text")}</CardDescription>
              </CardHeader>
              <CardContent>
                <PhoneStep phone={overview.phone} />
              </CardContent>
            </Card>
          ) : null}
          <RequestCard
            kind={path}
            request={path === "company" ? overview.company : overview.personal}
            limits={overview.limits}
            ready={path === "company" || overview.phone.verified}
          />
          {chosen !== null && requested === null ? (
            <Button variant="ghost" className="self-start" onClick={() => setChosen(null)}>
              {t("changePath")}
            </Button>
          ) : null}
        </>
      )}
    </div>
  );
}

function RequestCard({
  kind,
  request,
  limits,
  ready,
}: {
  kind: VerificationKind;
  request: VerificationRequest | null;
  limits: VerificationLimits;
  ready: boolean;
}) {
  const t = useTranslations("settings.verification");
  const format = useFormatter();
  const open = request === null || request.status === "REJECTED";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {t(`${kind}.title`)}
          {request ? (
            <Badge className={STATUS_CLASSES[request.status]}>{t(`request.status.${request.status}`)}</Badge>
          ) : null}
        </CardTitle>
        <CardDescription>{t(`${kind}.text`)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {request ? (
          <p className="text-sm text-muted-foreground">
            {t("request.submittedOn", {
              name: request.legalName,
              date: format.dateTime(new Date(request.submittedAt), { dateStyle: "long" }),
            })}
          </p>
        ) : null}
        {request?.status === "PENDING" ? <p className="text-sm">{t("request.pendingText")}</p> : null}
        {request?.status === "REJECTED" ? (
          <Alert variant="destructive">
            <AlertTitle>{t("request.rejectedTitle")}</AlertTitle>
            <AlertDescription>{request.rejectionReason ?? t("request.noReason")}</AlertDescription>
          </Alert>
        ) : null}
        {open && ready ? <RequestForm kind={kind} limits={limits} /> : null}
        {open && !ready ? <p className="text-sm text-muted-foreground">{t("personal.needsPhone")}</p> : null}
      </CardContent>
    </Card>
  );
}
