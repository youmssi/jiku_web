"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode } from "@/components/shared";
import { qrPath } from "@/lib/qr-path";
import { fetchBookingLinkAction } from "@/components/modules/services/services.service";

/** Pixels of the downloaded image, large enough to print. */
const QR_SIZE = 640;

/** The QR as a PNG data URL of [QR_SIZE] pixels, drawn from the same path as the preview. */
function qrPng(value: string): string | null {
  const qr = qrPath(value);
  const canvas = document.createElement("canvas");
  canvas.width = QR_SIZE;
  canvas.height = QR_SIZE;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, QR_SIZE, QR_SIZE);
  context.scale(QR_SIZE / qr.size, QR_SIZE / qr.size);
  context.fillStyle = "#000";
  context.fill(new Path2D(qr.path));
  return canvas.toDataURL("image/png");
}

/**
 * The QR a service shows at its entrance (JIKU-113): scanned with a phone, it
 * opens the page where a client takes a ticket for today's line and then
 * follows their place. The organizer downloads it to print.
 */
export function EntranceQrCard({ serviceId, serviceName }: { serviceId: string; serviceName: string }) {
  const t = useTranslations("services.entranceQr");
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, startLoading] = useTransition();

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
    if (!url) return;
    const image = qrPng(url);
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
              <QrCode value={url} label={url} className="size-40" />
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
