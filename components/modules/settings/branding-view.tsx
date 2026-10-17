"use client";

import { useRef, useState, useTransition } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { resizeImage, type ResizeRules } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  removeBrandImageAction,
  updateBrandingAction,
  uploadBrandImageAction,
  type BrandImageKind,
} from "./settings.service";
import type { BrandingResponse } from "./schema";

/**
 * Each photo is resized in the browser before it is sent, and refused below the
 * size the API accepts: a logo is square-ish and keeps its transparency, a banner
 * is a wide photo.
 */
const IMAGE_RULES: Record<BrandImageKind, ResizeRules> = {
  logo: { maxWidth: 512, minWidth: 128, minHeight: 128, type: "image/png" },
  banner: { maxWidth: 1600, minWidth: 600, minHeight: 150, type: "image/jpeg", quality: 0.82 },
};

interface BrandingViewProps {
  branding: BrandingResponse;
}

/**
 * The organization's look on guest pages, invitations and emails (JIKU-45): its
 * name, logo, banner and main color. The logo and banner are uploaded from the
 * device (JIKU-259) and saved at once; the name and color are saved together.
 */
export function BrandingView({ branding: initial }: BrandingViewProps) {
  const t = useTranslations("settings.branding");
  const router = useRouter();
  const [branding, setBranding] = useState(initial);
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [primaryColor, setPrimaryColor] = useState(initial.primaryColor);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await updateBrandingAction({
        displayName: displayName || null,
        logoUrl: branding.logoUrl,
        bannerUrl: branding.bannerUrl,
        primaryColor: primaryColor || null,
      });
      if (result.ok) {
        setBranding((current) => ({ ...current, displayName, primaryColor }));
        toast.success(t("saved"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function onImageChange(next: BrandingResponse) {
    setBranding((current) => ({ ...current, logoUrl: next.logoUrl, bannerUrl: next.bannerUrl }));
    router.refresh();
  }

  const hasChanges = displayName !== branding.displayName || primaryColor !== branding.primaryColor;

  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-hidden rounded-xl border">
        {branding.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- the organization's own banner, served by the API
          <img src={branding.bannerUrl} alt="" className="aspect-[4/1] w-full object-cover" />
        ) : null}
        <div className="flex items-center gap-3 px-5 py-4" style={{ backgroundColor: primaryColor, color: "#fff" }}>
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- the organization's own logo, served by the API
            <img src={branding.logoUrl} alt="" className="size-10 rounded-lg bg-white object-contain" />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-lg bg-white/20 text-lg font-bold">
              {(displayName || "J").charAt(0).toUpperCase()}
            </div>
          )}
          <p className="text-sm font-semibold">{displayName || t("previewFallback")}</p>
        </div>
        <p className="bg-card px-5 py-3 text-xs text-muted-foreground">{t("previewCaption")}</p>
      </div>

      <ImagePicker kind="logo" url={branding.logoUrl} onChange={onImageChange} />
      <ImagePicker kind="banner" url={branding.bannerUrl} onChange={onImageChange} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="displayName">{t("displayName")}</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t("previewFallback")}
          maxLength={255}
        />
        <p className="text-xs text-muted-foreground">{t("displayNameHint")}</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="primaryColor">{t("color")}</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            id="primaryColor"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="size-11 cursor-pointer rounded-lg border p-0.5"
          />
          <Input
            value={primaryColor}
            onChange={(e) => {
              const val = e.target.value;
              if (/^#[0-9a-fA-F]{0,6}$/.test(val)) setPrimaryColor(val);
            }}
            placeholder="#1E293B"
            maxLength={7}
            aria-label={t("color")}
            className="w-32 font-mono"
          />
        </div>
        <p className="text-xs text-muted-foreground">{t("colorHint")}</p>
      </div>

      <div>
        <Button onClick={handleSave} disabled={isPending || !hasChanges}>
          {isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}

/** One photo with its current image, and the actions to choose another or take it off. */
function ImagePicker({
  kind,
  url,
  onChange,
}: {
  kind: BrandImageKind;
  url: string | null;
  onChange: (branding: BrandingResponse) => void;
}) {
  const t = useTranslations("settings.branding");
  const input = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const inputId = `brand-${kind}`;

  function apply(result: { ok: true; data: BrandingResponse } | { ok: false; error: string }, success: string) {
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onChange(result.data);
    toast.success(success);
  }

  function upload(file: File | undefined) {
    if (!file) return;
    startTransition(async () => {
      const resized = await resizeImage(file, IMAGE_RULES[kind]);
      if (!resized) {
        toast.error(t(kind === "logo" ? "errors.logoTooSmall" : "errors.bannerTooSmall"));
        return;
      }
      const form = new FormData();
      form.append("file", resized, kind === "logo" ? "logo.png" : "banner.jpg");
      apply(await uploadBrandImageAction(kind, form), t("uploaded"));
    });
    if (input.current) input.current.value = "";
  }

  function remove() {
    startTransition(async () => apply(await removeBrandImageAction(kind), t("removed")));
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={inputId}>{t(kind)}</Label>
      <div className="flex flex-wrap items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- the organization's own photo, served by the API
          <img
            src={url}
            alt={t(kind === "logo" ? "logoAlt" : "bannerAlt")}
            className={cn("rounded-lg border bg-muted object-contain", kind === "logo" ? "size-16" : "h-16 w-64 max-w-full object-cover")}
          />
        ) : null}
        <input
          ref={input}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={(event) => upload(event.target.files?.[0])}
        />
        <Button variant="outline" disabled={isPending} onClick={() => input.current?.click()}>
          <ImagePlus aria-hidden />
          {isPending ? t("uploading") : url ? t("replace") : t("choose")}
        </Button>
        {url ? (
          <Button variant="ghost" disabled={isPending} onClick={remove} aria-label={t(kind === "logo" ? "removeLogo" : "removeBanner")}>
            <Trash2 aria-hidden />
            {t("remove")}
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">{t(kind === "logo" ? "logoHint" : "bannerHint")}</p>
    </div>
  );
}
