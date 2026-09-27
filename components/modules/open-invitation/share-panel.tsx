"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, Download, ExternalLink, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { openInvitationRoute } from "@/lib/constants";
import { whatsappShareLink } from "./share";

/** The downloaded card: a portrait image that reads well in a WhatsApp status or a chat. */
const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;
const QR_SIZE = 520;
const FALLBACK_COLOR = "#0F172A";

interface CardDetails {
  eventName: string;
  when: string | null;
  location: string | null;
  organizerName: string;
  primaryColor: string | null;
}

/**
 * How the organizer shares an open invitation (JIKU-184): the card's link to
 * copy, WhatsApp's share sheet with a ready message, and the card as an image
 * with its QR code, for a status, a chat or a print.
 */
export function SharePanel({ code, card }: { code: string; card: CardDetails }) {
  const t = useTranslations("events.openInvitation.share");
  const origin = useSyncExternalStore(noSubscription, () => window.location.origin, () => "");
  const url = `${origin}${openInvitationRoute(code)}`;
  const [copied, setCopied] = useState(false);
  const qr = useRef<HTMLCanvasElement>(null);

  const message = t("message", { event: card.eventName, when: card.when ?? "", url });

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  function download() {
    const image = drawCard(card, qr.current, { answer: t("cardAnswer"), footer: t("cardFooter") });
    if (!image) return;
    const anchor = document.createElement("a");
    anchor.href = image;
    anchor.download = t("fileName", { event: card.eventName });
    anchor.click();
  }

  return (
    <div className="grid gap-6 rounded-xl border p-4 md:grid-cols-[1fr_auto]">
      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <p className="text-sm font-medium">{t("title")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("text")}</p>
        </div>
        <div className="flex gap-2">
          <Input readOnly value={url} aria-label={t("link")} className="font-mono text-xs" />
          <Button type="button" variant="outline" size="icon" onClick={copy} aria-label={t("copy")}>
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          </Button>
          <Button asChild variant="outline" size="icon" aria-label={t("open")}>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink aria-hidden />
            </a>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <a href={whatsappShareLink(message)} target="_blank" rel="noopener noreferrer">
              <Share2 aria-hidden />
              {t("whatsapp")}
            </a>
          </Button>
          <Button type="button" variant="outline" onClick={download}>
            <Download aria-hidden />
            {t("download")}
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <div className="rounded-xl border bg-white p-3">
          <QRCodeCanvas ref={qr} value={url} size={QR_SIZE} marginSize={2} style={{ width: 140, height: 140 }} />
        </div>
      </div>
    </div>
  );
}

function noSubscription() {
  return () => {};
}

/** Draws the card on a canvas and returns it as a PNG data URL; null when the QR code is not ready. */
function drawCard(
  card: CardDetails,
  qr: HTMLCanvasElement | null,
  labels: { answer: string; footer: string },
): string | null {
  if (!qr) return null;
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const color = card.primaryColor ?? FALLBACK_COLOR;

  context.fillStyle = color;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  context.fillStyle = "rgba(255,255,255,0.08)";
  context.beginPath();
  context.arc(CARD_WIDTH - 120, 140, 320, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#FFFFFF";
  context.textAlign = "center";
  context.font = "500 36px sans-serif";
  context.fillText(card.organizerName, CARD_WIDTH / 2, 130);

  context.font = "700 76px sans-serif";
  const titleLines = wrap(context, card.eventName, CARD_WIDTH - 160).slice(0, 3);
  titleLines.forEach((line, index) => context.fillText(line, CARD_WIDTH / 2, 240 + index * 88));
  let y = 240 + titleLines.length * 88 + 20;

  context.font = "400 38px sans-serif";
  for (const line of [card.when, card.location].filter((value): value is string => Boolean(value))) {
    context.fillText(line, CARD_WIDTH / 2, y);
    y += 56;
  }

  const qrTop = Math.max(y + 30, 600);
  const qrLeft = (CARD_WIDTH - QR_SIZE - 40) / 2;
  context.fillStyle = "#FFFFFF";
  roundedRect(context, qrLeft, qrTop, QR_SIZE + 40, QR_SIZE + 40, 32);
  context.drawImage(qr, qrLeft + 20, qrTop + 20, QR_SIZE, QR_SIZE);

  context.fillStyle = "#FFFFFF";
  context.font = "600 40px sans-serif";
  context.fillText(labels.answer, CARD_WIDTH / 2, qrTop + QR_SIZE + 110);
  context.font = "400 28px sans-serif";
  context.fillStyle = "rgba(255,255,255,0.75)";
  context.fillText(labels.footer, CARD_WIDTH / 2, CARD_HEIGHT - 50);
  return canvas.toDataURL("image/png");
}

function wrap(context: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fill();
}
