import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { PublicOrgProfile } from "./schema";

/** Mixes a hex color toward `target` (black or white) by `amount` in [0, 1]. */
function mixHex(hex: string, target: string, amount: number): string {
  const from = hex.replace("#", "");
  const to = target.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(from) || !/^[0-9a-fA-F]{6}$/.test(to) || amount <= 0) {
    return hex;
  }
  const c1 = [0, 2, 4].map((i) => parseInt(from.slice(i, i + 2), 16));
  const c2 = [0, 2, 4].map((i) => parseInt(to.slice(i, i + 2), 16));
  const mixed = c1.map((v, i) => Math.round(v + (c2[i] - v) * amount));
  return `#${mixed.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

interface OrgPublicViewProps {
  profile: PublicOrgProfile;
}

/**
 * An organization's public "business card" (discovery page): name, logo and
 * the services bookable by short link. A visitor clicks a service and lands
 * on its booking page, no account needed.
 */
export function OrgPublicView({ profile }: OrgPublicViewProps) {
  const bannerStyle = {
    background: `linear-gradient(135deg, ${mixHex(profile.primaryColor, "#000000", 0.35)} 0%, ${profile.primaryColor} 55%, ${mixHex(profile.primaryColor, "#ffffff", 0.4)} 100%)`,
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
      <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10">
        {/* Brand banner */}
        <div className="relative h-36 w-full sm:h-44" style={profile.bannerUrl ? undefined : bannerStyle}>
          {profile.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- user-provided remote banner URL
            <img
              src={profile.bannerUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute -top-16 -right-10 size-52 rounded-full bg-white/10 blur-2xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 left-1/4 size-64 rounded-full bg-black/10 blur-3xl"
              />
            </>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, transparent 45%, rgba(255,255,255,0.14) 100%)",
            }}
          />
        </div>

        <div className="relative px-5 pb-7 sm:px-7">
          {/* Avatar overlapping the banner */}
          <div className="-mt-10 mb-4 flex items-end justify-between gap-4">
            <div className="size-20 overflow-hidden rounded-2xl shadow-lg ring-4 ring-card">
              <AspectRatio ratio={1 / 1} className="size-full">
                {profile.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- user-provided remote logo URL
                  <img
                    src={profile.logoUrl}
                    alt={profile.organizationName}
                    className="size-full object-cover"
                  />
                ) : (
                  <div
                    className="flex size-full items-center justify-center text-2xl font-bold text-white"
                    style={{ backgroundColor: profile.primaryColor }}
                  >
                    {profile.organizationName.slice(0, 1).toUpperCase()}
                  </div>
                )}
              </AspectRatio>
            </div>
            {profile.services.length > 0 ? (
              <Badge variant="outline" className="mb-1 gap-1.5 bg-card/80 backdrop-blur">
                <span className="relative flex size-2 shrink-0" aria-hidden>
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                Book online
              </Badge>
            ) : null}
          </div>

          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            {profile.organizationName}
            <Sparkles className="size-4 text-muted-foreground" aria-hidden />
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Book an appointment in a few taps — no account needed.
          </p>

          <Separator className="my-6" />

          {profile.services.length === 0 ? (
            <Empty className="py-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ArrowRight />
                </EmptyMedia>
                <EmptyTitle>No services to book yet</EmptyTitle>
                <EmptyDescription>
                  This organization has not published any bookable services — check back soon.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Bookable services
                </h2>
                <Badge variant="secondary">{profile.services.length} available</Badge>
              </div>
              <ul className="mt-3">
                {profile.services.map((service, index) => (
                  <li key={service.serviceId}>
                    <Link
                      href={`/r/${service.shortCode}`}
                      className="group flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/60"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <CalendarDays className="size-4" aria-hidden />
                        </span>
                        <span className="leading-tight">
                          <span className="block text-sm font-medium">{service.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            Pick a time that suits you
                          </span>
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                        Book
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </span>
                    </Link>
                    {index < profile.services.length - 1 ? <Separator className="ml-12 w-auto" /> : null}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
