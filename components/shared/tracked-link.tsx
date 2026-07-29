"use client";

import Link from "next/link";
import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * An internal `next/link` that also fires a tracking event on click (JIKU-59).
 * Kept as a thin client wrapper so the surrounding marketing sections stay
 * server components — only the trackable link itself ships client JS.
 */
export const TrackedLink = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<typeof Link> & { eventName: string; eventProperties?: Record<string, unknown> }
>(({ eventName, eventProperties, onClick, ...props }, ref) => (
  <Link
    {...props}
    ref={ref}
    onClick={(event) => {
      trackEvent(eventName, eventProperties);
      onClick?.(event);
    }}
  />
));
TrackedLink.displayName = "TrackedLink";

/** Same as [TrackedLink], for external/non-routed links (`wa.me`, `mailto:`). */
export const TrackedAnchor = forwardRef<
  HTMLAnchorElement,
  ComponentPropsWithoutRef<"a"> & { eventName: string; eventProperties?: Record<string, unknown> }
>(({ eventName, eventProperties, onClick, ...props }, ref) => (
  <a
    {...props}
    ref={ref}
    onClick={(event) => {
      trackEvent(eventName, eventProperties);
      onClick?.(event);
    }}
  />
));
TrackedAnchor.displayName = "TrackedAnchor";
