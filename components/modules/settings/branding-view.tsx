"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBrandingAction } from "./settings.service";
import type { BrandingResponse } from "./schema";

interface BrandingViewProps {
  branding: BrandingResponse;
}

export function BrandingView({ branding }: BrandingViewProps) {
  const [displayName, setDisplayName] = useState(branding.displayName);
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl ?? "");
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor);
  const [isPending, startTransition] = useTransition();
  const [previewColor, setPreviewColor] = useState(branding.primaryColor);

  function handleSave() {
    startTransition(async () => {
      const result = await updateBrandingAction({
        displayName: displayName || null,
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || null,
      });
      if (result.ok) {
        setPreviewColor(primaryColor);
        toast.success("Branding saved.");
      } else {
        toast.error(result.error ?? "Could not save branding.");
      }
    });
  }

  const hasChanges =
    displayName !== branding.displayName ||
    logoUrl !== (branding.logoUrl ?? "") ||
    primaryColor !== branding.primaryColor;

  return (
    <div className="space-y-8">
      {/* Live preview card */}
      <div className="overflow-hidden rounded-xl border">
        <div className="flex items-center gap-3 px-5 py-4" style={{ backgroundColor: previewColor, color: "#fff" }}>
          {logoUrl ? (
            <img src={logoUrl} alt="" className="size-10 rounded-lg object-contain" />
          ) : (
            <div className="flex size-10 items-center justify-center rounded-lg bg-white/20 text-lg font-bold">
              {(displayName || "J").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="leading-tight">
            <p className="text-sm font-semibold">{displayName || "Your organization"}</p>
            <p className="text-xs opacity-80">Jikū</p>
          </div>
        </div>
        <div className="bg-card px-5 py-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Preview: how your branding looks in the sidebar
          </p>
        </div>
      </div>

      {/* Display name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Organization name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your organization"
          maxLength={255}
        />
        <p className="text-xs text-muted-foreground">
          Shown to guests on invitations, tickets, and the guest page.
        </p>
      </div>

      {/* Logo URL */}
      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input
          id="logoUrl"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://example.com/logo.png"
          maxLength={2048}
        />
        <p className="text-xs text-muted-foreground">
          A square logo works best. Host it yourself, or use a service like ImgBB, Cloudinary, or your own CDN.
        </p>
      </div>

      {/* Primary color */}
      <div className="space-y-2">
        <Label htmlFor="primaryColor">Primary brand color</Label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              id="primaryColor"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="size-10 cursor-pointer rounded-lg border p-0.5"
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
            className="w-32 font-mono"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Used for buttons and accents on guest-facing pages. Enter a 6-digit hex value (e.g. #2563EB).
        </p>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={isPending || !hasChanges}>
          {isPending ? "Saving…" : "Save branding"}
        </Button>
        {!hasChanges && (
          <span className="text-xs text-muted-foreground">No changes to save.</span>
        )}
      </div>
    </div>
  );
}
