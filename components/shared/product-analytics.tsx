"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    /** Set once product analytics has started: forwards a business event to it (JIKU-311). */
    jikuProductEvent?: (name: string, properties?: Record<string, unknown>) => void;
  }
}

/** The ingestion host's region, e.g. "eu" for https://eu.i.posthog.com. */
const POSTHOG_INGEST_HOST = /^https:\/\/([a-z]+)\.i\.posthog\.com\/?$/;

/**
 * Product analytics for the organizer space only (JIKU-311): funnels, paths,
 * retention and session recordings to see where people hesitate or give up.
 * Never mounted on guest pages. Every input and every text is masked in
 * recordings and in clicks, so no guest name, phone or e-mail leaves the page.
 * The SDK is loaded after the page, in the browser only, and nothing starts
 * until NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST are set.
 */
export function ProductAnalytics({
  userId,
  organizationId,
  role,
}: Readonly<{ userId: string; organizationId: string; role: string }>) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key || !host) return;
    const region = POSTHOG_INGEST_HOST.exec(host)?.[1];
    let active = true;
    import("posthog-js")
      .then(({ default: posthog }) => {
        if (!active) return;
        if (!posthog.__loaded) {
          posthog.init(key, {
            api_host: host,
            ui_host: region ? `https://${region}.posthog.com` : undefined,
            // No cookie and no local storage, as the privacy policy promises:
            // the person is identified again on every load.
            persistence: "memory",
            person_profiles: "identified_only",
            capture_pageview: "history_change",
            capture_pageleave: true,
            capture_dead_clicks: true,
            mask_all_text: true,
            mask_all_element_attributes: true,
            session_recording: { maskAllInputs: true, maskTextSelector: "*" },
          });
        }
        posthog.identify(userId, { role });
        posthog.group("organization", organizationId);
        window.jikuProductEvent = (name, properties) => posthog.capture(name, properties);
      })
      .catch(() => {
        // Analytics must never break the page an organizer is using.
      });
    return () => {
      active = false;
    };
  }, [userId, organizationId, role]);
  return null;
}
