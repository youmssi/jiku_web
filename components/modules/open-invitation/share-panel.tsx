"use client";

import { useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Copy, Download, ExternalLink, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { openInvitationRoute } from "@/lib/constants";
import { whatsappShareLink } from "./share";

interface CardDetails {
  eventName: string;
  when: string | null;
  /** The last moment to answer, already written for people; null when answers stay open until the event. */
  answerBy: string | null;
}

/**
 * How the organizer shares an open invitation (JIKU-184, JIKU-194): the card's
 * link to copy, WhatsApp's share sheet with a ready message, and the card as a
 * portrait image drawn by the server in the event's style, for a status, a chat
 * or a print.
 */
export function SharePanel({ code, card }: { code: string; card: CardDetails }) {
  const t = useTranslations("events.openInvitation.share");
  const locale = useLocale();
  const origin = useSyncExternalStore(noSubscription, () => window.location.origin, () => "");
  const url = `${origin}${openInvitationRoute(code)}`;
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const message = t("message", {
    event: card.eventName,
    when: [card.when, card.answerBy ? t("cardAnswerBy", { date: card.answerBy }) : null].filter(Boolean).join("\n"),
    url,
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  async function download() {
    setDownloading(true);
    try {
      const response = await fetch(`/api/cards/${encodeURIComponent(code)}?format=portrait&lang=${locale}&v=${Date.now()}`);
      if (!response.ok) throw new Error(`card ${response.status}`);
      const image = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = image;
      anchor.download = t("fileName", { event: card.eventName });
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(image), 1000);
    } catch {
      toast.error(t("downloadFailed"));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <p className="text-sm font-medium">{t("title")}</p>
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
        <Button type="button" variant="outline" onClick={download} disabled={downloading}>
          {downloading ? <Loader2 aria-hidden className="animate-spin" /> : <Download aria-hidden />}
          {t("download")}
        </Button>
      </div>
    </div>
  );
}

function noSubscription() {
  return () => {};
}
