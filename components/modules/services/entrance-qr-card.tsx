"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchBookingLinkAction } from "@/components/modules/services/services.service";

/** Pixels of the downloaded image, large enough to print; the preview is smaller. */
const QR_SIZE = 640;
const QR_PREVIEW = 160;

/**
 * The QR a service shows at its entrance (JIKU-113): scanned with a phone, it
 * opens the page where a client takes a ticket for today's line and then
 * follows their place. The organizer downloads it to print.
 */
export function EntranceQrCard({ serviceId, serviceName }: { serviceId: string; serviceName: string }) {
  const t = useTranslations("services.entranceQr");
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, startLoading] = useTransition();
  const canvas = useRef<HTMLCanvasElement>(null);

  function show() {
    startLoading(async () => {
      const result = await fetchBookingLinkAction(serviceId);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setUrl(`${window.location.origin}/r/${result.data.shortCode}/line`);
    });
  }

  function download() {
    const image = canvas.current?.toDataURL("image/png");
    if (!image) return;
    const anchor = document.createElement("a");
    anchor.href = image;
    anchor.download = t("fileName", { service: serviceName });
    anchor.click();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">{t("text")}</p>
        {url ? (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <div className="rounded-xl border bg-white p-3">
              <QRCodeCanvas ref={canvas} value={url} size={QR_SIZE} marginSize={2} style={{ width: QR_PREVIEW, height: QR_PREVIEW }} />
            </div>
            <div className="flex flex-col gap-2">
              <code className="max-w-full break-all rounded bg-muted px-2 py-1 font-mono text-xs">{url}</code>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={download}>
                  <Download className="size-3.5" />
                  {t("download")}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={url} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-3.5" />
                    {t("open")}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="self-start" onClick={show} disabled={isLoading}>
            {t("show")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
