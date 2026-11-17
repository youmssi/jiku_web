"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Download, Link2, MessageCircle, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Stat, whatsappChatLink } from "@/components/shared";
import { ROUTES } from "@/lib/constants";
import { updateServicePlaceAction } from "@/components/modules/services/services.service";
import type { ServiceShare } from "@/components/modules/services/schema";

/**
 * The Share tab's screen (JIKU-189). `"use client"`: copying the link, sharing
 * and editing the place react in the page. An organization not yet verified
 * sees its card as a preview, with the way to get verified instead of the
 * share buttons (ADR 106).
 */
export function ServiceSharePanel({
  serviceId,
  serviceName,
  place,
  share,
  link,
  cardUrl,
}: {
  serviceId: string;
  serviceName: string;
  place: string;
  share: ServiceShare;
  link: string;
  cardUrl: string;
}) {
  const t = useTranslations("services.share");
  const [value, setValue] = useState(place);
  const [version, setVersion] = useState(0);
  const [pending, startTransition] = useTransition();
  const canShare = share.canShare ?? false;
  const message = t("message", { service: serviceName, link });

  function savePlace() {
    startTransition(async () => {
      const result = await updateServicePlaceAction(serviceId, value);
      if (!result.ok) return void toast.error(result.error);
      toast.success(t("placeSaved"));
      setVersion((current) => current + 1);
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr]">
          {/* eslint-disable-next-line @next/next/no-img-element -- a generated PNG served by our own route, refreshed after an edit. */}
          <img
            src={`${cardUrl}&v=${version}`}
            alt={t("cardAlt", { service: serviceName })}
            width={1080}
            height={1350}
            className="h-auto w-full max-w-64 rounded-lg border"
          />
          <div className="flex flex-col gap-4">
            {canShare ? (
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <a href={whatsappChatLink("", message)} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="size-4" aria-hidden />
                    {t("whatsapp")}
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={cardUrl} download={`${serviceName}.png`}>
                    <Download className="size-4" aria-hidden />
                    {t("download")}
                  </a>
                </Button>
                <Button variant="outline" onClick={copy}>
                  <Link2 className="size-4" aria-hidden />
                  {t("copy")}
                </Button>
                <p className="break-all text-xs text-muted-foreground">{link}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="size-4" aria-hidden />
                  {t("verifyFirst")}
                </p>
                <Button asChild variant="outline" className="self-start">
                  <Link href={`${ROUTES.SETTINGS}?tab=verification`}>{t("verify")}</Link>
                </Button>
              </div>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                savePlace();
              }}
            >
              <Field>
                <FieldLabel htmlFor="service-place">{t("place")}</FieldLabel>
                <div className="flex gap-2">
                  <Input
                    id="service-place"
                    value={value}
                    maxLength={160}
                    placeholder={t("placePlaceholder")}
                    onChange={(event) => setValue(event.target.value)}
                  />
                  <Button type="submit" variant="outline" disabled={pending || value.trim() === place.trim()}>
                    {pending ? <Spinner /> : null}
                    {t("save")}
                  </Button>
                </div>
                <FieldDescription>{t("placeHelp")}</FieldDescription>
              </Field>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("results", { days: share.windowDays ?? 30 })}</CardTitle>
          <CardDescription>{t("resultsHelp")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label={t("opensCard")} value={share.opens?.card ?? 0} />
          <Stat label={t("opensLink")} value={share.opens?.link ?? 0} />
          <Stat label={t("bookingsCard")} value={share.bookings?.card ?? 0} />
          <Stat label={t("bookingsLink")} value={share.bookings?.link ?? 0} />
        </CardContent>
      </Card>
    </div>
  );
}
