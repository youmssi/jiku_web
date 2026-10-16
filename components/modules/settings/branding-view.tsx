"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBrandingAction } from "./settings.service";
import type { BrandingResponse } from "./schema";

const ACCEPTED_FORMATS = [".jpg", ".jpeg", ".png"];

/** Recommended pixel size for each image: crisp everywhere it's reused (sidebar, public avatar, email header) without being cropped. */
const LOGO_RECOMMENDED = { width: 512, height: 512, shape: "logo" } as const;
const BANNER_RECOMMENDED = { width: 1200, height: 300, shape: "banner" } as const;

type Recommended = typeof LOGO_RECOMMENDED | typeof BANNER_RECOMMENDED;

/** What is off about an image, worded at render time in the viewer's language. */
type ImageWarning =
  | { kind: "format" }
  | { kind: "cropped" | "small"; width: number; height: number; recommended: Recommended };

type ImageCheck =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "ok"; width: number; height: number; warnings: ImageWarning[] }
  | { status: "error" };

/** The outcome of the most recently *completed* check, tagged with the url it was for. */
type ImageResult =
  | { url: string; status: "ok"; width: number; height: number; warnings: ImageWarning[] }
  | { url: string; status: "error" };

/**
 * Loads `url` as an image client-side and reports its pixel size against
 * `recommended`, without a network round-trip through the server. "checking"
 * is derived by comparing the in-flight url against the last completed
 * result, so the effect itself never calls setState synchronously — only the
 * image's own load/error callbacks do.
 */
function useImageCheck(
  url: string,
  recommended: Recommended,
): ImageCheck {
  const trimmed = url.trim();
  const [result, setResult] = useState<ImageResult | null>(null);

  useEffect(() => {
    if (!trimmed) {
      return;
    }
    const image = new Image();
    let cancelled = false;
    image.onload = () => {
      if (cancelled) return;
      const { naturalWidth: width, naturalHeight: height } = image;
      const warnings: ImageWarning[] = [];
      const hasAcceptedExtension = ACCEPTED_FORMATS.some((ext) =>
        trimmed.toLowerCase().split("?")[0].endsWith(ext),
      );
      if (!hasAcceptedExtension) {
        warnings.push({ kind: "format" });
      }
      const expectedRatio = recommended.width / recommended.height;
      const actualRatio = width / height;
      const ratioOffBy = Math.abs(actualRatio - expectedRatio) / expectedRatio;
      if (ratioOffBy > 0.05) {
        warnings.push({ kind: "cropped", width, height, recommended });
      } else if (width < recommended.width) {
        warnings.push({ kind: "small", width, height, recommended });
      }
      setResult({ url: trimmed, status: "ok", width, height, warnings });
    };
    image.onerror = () => {
      if (!cancelled) setResult({ url: trimmed, status: "error" });
    };
    image.src = trimmed;
    return () => {
      cancelled = true;
    };
  }, [trimmed, recommended]);

  if (!trimmed) return { status: "idle" };
  if (!result || result.url !== trimmed) return { status: "checking" };
  return result;
}

function ImageWarnings({ warnings, className }: { warnings: ImageWarning[]; className: string }) {
  const t = useTranslations("settings.branding");
  if (warnings.length === 0) return null;
  return (
    <ul className={className}>
      {warnings.map((warning) => {
        const text =
          warning.kind === "format"
            ? t("warnFormat")
            : t(
                warning.kind === "small"
                  ? "warnSmall"
                  : warning.recommended.shape === "logo"
                    ? "warnCroppedLogo"
                    : "warnCroppedBanner",
                {
                  width: warning.width,
                  height: warning.height,
                  expectedWidth: warning.recommended.width,
                  expectedHeight: warning.recommended.height,
                },
              );
        return (
          <li key={warning.kind} className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-500">
            <AlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden />
            {text}
          </li>
        );
      })}
    </ul>
  );
}

interface BrandingViewProps {
  branding: BrandingResponse;
}

export function BrandingView({ branding }: BrandingViewProps) {
  const t = useTranslations("settings.branding");
  const [displayName, setDisplayName] = useState(branding.displayName);
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl ?? "");
  const [bannerUrl, setBannerUrl] = useState(branding.bannerUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor);
  const [isPending, startTransition] = useTransition();
  const [previewColor, setPreviewColor] = useState(branding.primaryColor);
  const logoCheck = useImageCheck(logoUrl, LOGO_RECOMMENDED);
  const bannerCheck = useImageCheck(bannerUrl, BANNER_RECOMMENDED);

  function handleSave() {
    startTransition(async () => {
      const result = await updateBrandingAction({
        displayName: displayName || null,
        logoUrl: logoUrl || null,
        bannerUrl: bannerUrl || null,
        primaryColor: primaryColor || null,
      });
      if (result.ok) {
        setPreviewColor(primaryColor);
        toast.success(t("saved"));
      } else {
        toast.error(result.error);
      }
    });
  }

  const hasChanges =
    displayName !== branding.displayName ||
    logoUrl !== (branding.logoUrl ?? "") ||
    bannerUrl !== (branding.bannerUrl ?? "") ||
    primaryColor !== branding.primaryColor;

  return (
    <div className="space-y-8">
      {/* Live preview card */}
      <div className="overflow-hidden rounded-xl border">
        <div className="flex items-center gap-3 px-5 py-4" style={{ backgroundColor: previewColor, color: "#fff" }}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-provided remote logo URL
            <img src={logoUrl} alt="" className="size-10 rounded-lg object-contain" />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-lg bg-white/20 text-lg font-bold">
              {(displayName || "J").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="leading-tight">
            <p className="text-sm font-semibold">{displayName || t("previewFallback")}</p>
            <p className="text-xs opacity-80">Jikū</p>
          </div>
        </div>
        <div className="bg-card px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {t("previewCaption")}
          </p>
        </div>
      </div>

      {/* Display name */}
      <div className="space-y-2">
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

      {/* Logo URL */}
      <div className="space-y-2">
        <Label htmlFor="logoUrl">{t("logoUrl")}</Label>
        <Input
          id="logoUrl"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
          maxLength={2048}
          aria-invalid={logoCheck.status === "error"}
        />
        <p className="text-xs text-muted-foreground">
          {t("logoHint", { width: LOGO_RECOMMENDED.width, height: LOGO_RECOMMENDED.height })}
        </p>
        {logoUrl.trim() ? (
          <div className="pt-2">
            <Attachment state={logoCheck.status === "error" ? "error" : logoCheck.status === "checking" ? "processing" : "done"}>
              <AttachmentMedia variant="image">
                {/* eslint-disable-next-line @next/next/no-img-element -- user-provided remote logo URL */}
                <img src={logoUrl} alt={t("logoAlt")} />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>{t("logo")}</AttachmentTitle>
                <AttachmentDescription>
                  {logoCheck.status === "error"
                    ? t("loadFailed")
                    : logoCheck.status === "checking"
                      ? t("checking")
                      : logoCheck.status === "ok" && logoCheck.warnings.length === 0
                        ? t("looksGood", { width: logoCheck.width, height: logoCheck.height })
                        : t("logoDefault")}
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction
                  aria-label={t("removeLogo")}
                  onClick={() => setLogoUrl("")}
                >
                  <X className="size-3.5" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
            {logoCheck.status === "ok" ? (
              <ImageWarnings warnings={logoCheck.warnings} className="mt-2 flex flex-col gap-1" />
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Banner URL */}
      <div className="space-y-2">
        <Label htmlFor="bannerUrl">{t("bannerUrl")}</Label>
        <Input
          id="bannerUrl"
          value={bannerUrl}
          onChange={(e) => setBannerUrl(e.target.value)}
          placeholder="https://example.com/banner.png"
          maxLength={2048}
          aria-invalid={bannerCheck.status === "error"}
        />
        <p className="text-xs text-muted-foreground">
          {t("bannerHint", { width: BANNER_RECOMMENDED.width, height: BANNER_RECOMMENDED.height })}
        </p>
        {bannerUrl.trim() ? (
          <div className="space-y-2 pt-2">
            <div className="overflow-hidden rounded-lg border">
              <AspectRatio ratio={BANNER_RECOMMENDED.width / BANNER_RECOMMENDED.height}>
                {bannerCheck.status === "error" ? (
                  <div className="flex size-full items-center justify-center bg-muted text-xs text-muted-foreground">
                    {t("loadFailedShort")}
                  </div>

                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- user-provided remote banner URL
                  <img src={bannerUrl} alt={t("bannerAlt")} className="size-full object-cover" />
                )}
              </AspectRatio>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                {bannerCheck.status === "checking"
                  ? t("checking")
                  : bannerCheck.status === "ok" && bannerCheck.warnings.length === 0
                    ? t("looksGood", { width: bannerCheck.width, height: bannerCheck.height })
                    : bannerCheck.status === "error"
                      ? t("checkUrl")
                      : null}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setBannerUrl("")}>
                <X className="size-3.5" data-icon="inline-start" />
                {t("remove")}
              </Button>
            </div>
            {bannerCheck.status === "ok" ? (
              <ImageWarnings warnings={bannerCheck.warnings} className="flex flex-col gap-1" />
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Primary color */}
      <div className="space-y-2">
        <Label htmlFor="primaryColor">{t("color")}</Label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              id="primaryColor"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="size-11 cursor-pointer rounded-lg border p-0.5"
              style={{ backgroundColor: primaryColor }}
            />
          </div>
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

      {/* Save */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={isPending || !hasChanges}>
          {isPending ? t("saving") : t("save")}
        </Button>
        {!hasChanges && (
          <span className="text-xs text-muted-foreground">{t("noChanges")}</span>
        )}
      </div>
    </div>
  );
}
