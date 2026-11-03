"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Copy, Download, ExternalLink, Loader2, MessageCircle, Send, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";
import { openInvitationRoute } from "@/lib/constants";
import { facebookShareLink, telegramShareLink, whatsappShareLink } from "./share";

interface CardDetails {
  eventName: string;
  when: string | null;
  /** The last moment to answer, already written for people; null when answers stay open until the event. */
  answerBy: string | null;
}

/**
 * How the organizer shares an open invitation (JIKU-184, JIKU-194, JIKU-280).
 * On a phone, "Share…" opens the system share sheet with the card image and the
 * ready message, so it reaches WhatsApp, Facebook, Messenger, Telegram or SMS
 * from one button. Direct WhatsApp, Facebook and Telegram links, the link to
 * copy and the image to download cover computers and older browsers.
 */
export function SharePanel({ code, card }: { code: string; card: CardDetails }) {
  const t = useTranslations("events.openInvitation.share");
  const locale = useLocale();
  const origin = useSyncExternalStore(noSubscription, () => window.location.origin, () => "");
  const canShare = useSyncExternalStore(noSubscription, () => typeof navigator.share === "function", () => false);
  const url = `${origin}${openInvitationRoute(code)}`;
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const image = useRef<Promise<File | null> | null>(null);
  const fileName = t("fileName", { event: card.eventName });

  const message = t("message", {
    event: card.eventName,
    when: [card.when, card.answerBy ? t("cardAnswerBy", { date: card.answerBy }) : null].filter(Boolean).join("\n"),
    url,
  });

  function cardImage(): Promise<File | null> {
    image.current ??= fetch(`/api/cards/${encodeURIComponent(code)}?format=portrait&lang=${locale}&v=${Date.now()}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`card ${response.status}`);
        return new File([await response.blob()], fileName, { type: "image/png" });
      })
      .catch(() => {
        image.current = null;
        return null;
      });
    return image.current;
  }

  // The share sheet must open within the tap; the image is fetched ahead so no wait breaks it.
  useEffect(() => {
    if (canShare) void cardImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canShare]);

  async function share() {
    const file = await cardImage();
    const withImage = file !== null && navigator.canShare?.({ files: [file] }) === true;
    try {
      await navigator.share(withImage ? { files: [file], text: message } : { text: message });
      trackEvent("card_shared", { network: withImage ? "share_image" : "share_text" });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      window.open(whatsappShareLink(message), "_blank", "noopener,noreferrer");
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackEvent("card_shared", { network: "link" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  async function download() {
    setDownloading(true);
    try {
      const file = await cardImage();
      if (!file) throw new Error("card image");
      const href = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = fileName;
      anchor.click();
      trackEvent("card_shared", { network: "image" });
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch {
      toast.error(t("downloadFailed"));
    } finally {
      setDownloading(false);
    }
  }

  const networks = [
    { network: "whatsapp", href: whatsappShareLink(message), label: t("whatsapp"), icon: MessageCircle },
    { network: "facebook", href: facebookShareLink(url), label: t("facebook"), icon: Share2 },
    { network: "telegram", href: telegramShareLink(url, message), label: t("telegram"), icon: Send },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <p className="text-sm font-medium">{t("title")}</p>
      <div className="flex gap-2">
        <Input readOnly value={url} aria-label={t("link")} className="font-mono text-xs" />
        <Button type="button" variant="outline" size="icon" className="max-md:size-11" onClick={copy} aria-label={t("copy")}>
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </Button>
        <Button asChild variant="outline" size="icon" className="max-md:size-11" aria-label={t("open")}>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink aria-hidden />
          </a>
        </Button>
      </div>
      {canShare ? (
        <div className="flex flex-col gap-1.5">
          <Button type="button" className="max-md:h-11" onClick={share}>
            <Share2 aria-hidden />
            {t("share")}
          </Button>
          <p className="text-xs text-muted-foreground">{t("shareHint")}</p>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {networks.map(({ network, href, label, icon: Icon }, index) => (
          <Button key={network} asChild variant={!canShare && index === 0 ? "default" : "outline"} className="max-md:h-11">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("card_shared", { network })}
            >
              <Icon aria-hidden />
              {label}
            </a>
          </Button>
        ))}
        <Button type="button" variant="outline" className="max-md:h-11" onClick={download} disabled={downloading}>
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
