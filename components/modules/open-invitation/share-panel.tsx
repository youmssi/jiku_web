"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronDown, Copy, Download, ExternalLink, Loader2, MessageCircle, Send, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";
import { openInvitationRoute } from "@/lib/constants";
import { routing } from "@/i18n/routing";
import { outgoingTranslator, type OutgoingWords } from "@/components/shared/outgoing-words";
import { recordShareAction } from "./open-invitation.service";
import { facebookShareLink, taggedLink, telegramShareLink, whatsappShareLink, type CardSource } from "./share";

/** The card images an organizer can save (JIKU-283): a status, a post, a link-sized landscape. */
const DOWNLOAD_FORMATS = ["status", "portrait", "landscape"] as const;
type DownloadFormat = (typeof DOWNLOAD_FORMATS)[number];

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
export function SharePanel({
  eventId,
  code,
  card,
  version,
  words,
}: {
  eventId: string;
  code: string;
  card: CardDetails;
  /** The card's look fingerprint (JIKU-283): a changed card gets a fresh link preview. */
  version?: string;
  /** The words of the shared message, in the event's guest language (JIKU-293). */
  words: OutgoingWords;
}) {
  const t = useTranslations("events.openInvitation.share");
  const outgoing = outgoingTranslator(words);
  // The card opens, and its image is drawn, in the guests' language whatever the organizer reads.
  const locale = words.locale;
  const origin = useSyncExternalStore(noSubscription, () => window.location.origin, () => "");
  const canShare = useSyncExternalStore(noSubscription, () => typeof navigator.share === "function", () => false);
  const url = `${origin}${locale === routing.defaultLocale ? "" : `/${locale}`}${openInvitationRoute(code)}`;
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const image = useRef<Promise<File | null> | null>(null);
  const fileName = t("fileName", { event: card.eventName });

  const when = [card.when, card.answerBy ? outgoing("answerBy", { date: card.answerBy }) : null].filter(Boolean).join("\n");
  // Every link carries the network it leaves through, so its visits and answers count there (JIKU-282).
  const link = (source: CardSource) => taggedLink(url, source, version);
  const messageFor = (source: CardSource) => outgoing("share", { event: card.eventName, when, url: link(source) });

  function counted(source: CardSource) {
    trackEvent("card_shared", { network: source });
    void recordShareAction(eventId, source);
  }

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
      const text = messageFor("share");
      await navigator.share(withImage ? { files: [file], text } : { text });
      counted("share");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      counted("whatsapp");
      window.open(whatsappShareLink(messageFor("whatsapp")), "_blank", "noopener,noreferrer");
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link("link"));
      setCopied(true);
      counted("link");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  async function download(format: DownloadFormat) {
    setDownloading(true);
    try {
      const response = await fetch(`/api/cards/${encodeURIComponent(code)}?format=${format}&lang=${locale}&v=${version ?? ""}`);
      if (!response.ok) throw new Error(`card ${response.status}`);
      const href = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = t(`formats.${format}.fileName`, { event: card.eventName });
      anchor.click();
      // The image's QR code carries its own tag; posting the image is a share by QR.
      counted("qr");
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch {
      toast.error(t("downloadFailed"));
    } finally {
      setDownloading(false);
    }
  }

  const networks: { network: CardSource; href: string; label: string; icon: typeof Share2 }[] = [
    { network: "whatsapp", href: whatsappShareLink(messageFor("whatsapp")), label: t("whatsapp"), icon: MessageCircle },
    { network: "facebook", href: facebookShareLink(link("facebook")), label: t("facebook"), icon: Share2 },
    { network: "telegram", href: telegramShareLink(link("telegram"), messageFor("telegram")), label: t("telegram"), icon: Send },
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
              onClick={() => counted(network)}
            >
              <Icon aria-hidden />
              {label}
            </a>
          </Button>
        ))}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="max-md:h-11" disabled={downloading}>
              {downloading ? <Loader2 aria-hidden className="animate-spin" /> : <Download aria-hidden />}
              {t("download")}
              <ChevronDown aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {DOWNLOAD_FORMATS.map((format) => (
              <DropdownMenuItem key={format} className="flex-col items-start gap-0.5 py-2" onSelect={() => void download(format)}>
                <span className="font-medium">{t(`formats.${format}.label`)}</span>
                <span className="text-xs text-muted-foreground">{t(`formats.${format}.hint`)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function noSubscription() {
  return () => {};
}
