"use client";

import { useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { brandBackground, CARD_STYLE_TOKENS, CARD_STYLES, cardStyleOf, displayTitle, type CardStyle } from "@/lib/card-style";
import { cn } from "@/lib/utils";
import { removeBannerAction, saveCardStyleAction, uploadBannerAction } from "./open-invitation.service";
import type { EventLook } from "./schema";

/** The banner is sent resized: wide enough for a retina phone, light enough for a slow network. */
const BANNER_MAX_WIDTH = 1600;
const BANNER_QUALITY = 0.82;
const BANNER_MIN_WIDTH = 600;
const BANNER_MIN_HEIGHT = 300;

/**
 * How the event looks to guests (JIKU-194): one of three styles and an optional
 * banner photo, with the card as guests will receive it. Every guest surface —
 * the card, the link preview, the answer page, the ticket — follows the choice.
 */
export function CardLook({
  eventId,
  code,
  look,
  color,
}: {
  eventId: string;
  code: string;
  look: EventLook;
  color: string;
}) {
  const t = useTranslations("events.openInvitation.look");
  const locale = useLocale();
  const [style, setStyle] = useState<CardStyle>(cardStyleOf(look.cardStyle));
  const [bannerUrl, setBannerUrl] = useState<string | null>(look.bannerUrl ?? null);
  const [pending, startTransition] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const version = encodeURIComponent(`${style}-${bannerUrl ?? ""}`);
  const preview = `/api/cards/${encodeURIComponent(code)}?format=portrait&lang=${locale}&v=${version}`;

  function apply(result: { ok: true; data: EventLook } | { ok: false; error: string }) {
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setStyle(cardStyleOf(result.data.cardStyle));
    setBannerUrl(result.data.bannerUrl ?? null);
  }

  function pick(next: CardStyle) {
    if (next === style) return;
    const previous = style;
    setStyle(next);
    startTransition(async () => {
      const result = await saveCardStyleAction(eventId, next);
      if (!result.ok) setStyle(previous);
      apply(result);
    });
  }

  function upload(file: File | undefined) {
    if (!file) return;
    startTransition(async () => {
      const resized = await resize(file);
      if (!resized) {
        toast.error(t("photoTooSmall"));
        return;
      }
      const form = new FormData();
      form.append("file", resized, "banner.jpg");
      apply(await uploadBannerAction(eventId, form));
    });
  }

  function remove() {
    startTransition(async () => apply(await removeBannerAction(eventId)));
  }

  return (
    <section className="grid gap-6 rounded-xl border p-4 md:grid-cols-[1fr_auto]" aria-busy={pending}>
      <div className="flex min-w-0 flex-col gap-5">
        <div>
          <h3 className="text-sm font-medium">{t("title")}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("text")}</p>
        </div>

        <div role="radiogroup" aria-label={t("styleLabel")} className="grid grid-cols-3 gap-2">
          {CARD_STYLES.map((option) => {
            const tokens = CARD_STYLE_TOKENS[option];
            const selected = option === style;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={pending}
                onClick={() => pick(option)}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-lg border-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait",
                  selected ? "border-foreground" : "border-transparent ring-1 ring-border hover:ring-foreground/40",
                )}
              >
                <span
                  className="relative flex h-20 items-end p-2.5 text-white"
                  style={{ backgroundImage: brandBackground(option, color), backgroundColor: color }}
                >
                  <span style={displayTitle(tokens, "1.35rem")}>Aa</span>
                  {selected ? (
                    <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-white text-black">
                      <Check aria-hidden className="size-3.5" />
                    </span>
                  ) : null}
                </span>
                <span className="px-2.5 py-2 text-xs font-semibold" style={{ background: tokens.panel, color: tokens.panelInk }}>
                  {t(`styles.${option}`)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{t("photo")}</p>
          <div className="flex flex-wrap items-center gap-3">
            {bannerUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerUrl} alt="" className="h-14 w-24 rounded-md object-cover ring-1 ring-border" />
            ) : null}
            <input
              ref={input}
              type="file"
              accept="image/jpeg,image/png"
              className="sr-only"
              tabIndex={-1}
              onChange={(event) => {
                upload(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <Button type="button" variant="outline" disabled={pending} onClick={() => input.current?.click()}>
              <ImagePlus aria-hidden />
              {bannerUrl ? t("changePhoto") : t("addPhoto")}
            </Button>
            {bannerUrl ? (
              <Button type="button" variant="ghost" disabled={pending} onClick={remove}>
                <Trash2 aria-hidden />
                {t("removePhoto")}
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">{t("photoHelp")}</p>
        </div>
      </div>

      <figure className="flex flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={preview}
          src={preview}
          alt={t("preview")}
          width={216}
          height={270}
          className={cn("w-[216px] rounded-lg bg-muted shadow-md transition-opacity", pending && "opacity-60")}
        />
        <figcaption className="text-xs text-muted-foreground">{t("preview")}</figcaption>
      </figure>
    </section>
  );
}

/** The photo as a JPEG at most BANNER_MAX_WIDTH wide; null when it is too small to fill a banner. */
async function resize(file: File): Promise<Blob | null> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return null;
  if (bitmap.width < BANNER_MIN_WIDTH || bitmap.height < BANNER_MIN_HEIGHT) return null;
  const scale = Math.min(1, BANNER_MAX_WIDTH / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", BANNER_QUALITY));
}
