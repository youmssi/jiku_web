"use client";

import { useEffect, useRef, useState } from "react";
import type { Schema } from "@/lib/api-contract";

/** A signed right to follow one topic of the live stream (JIKU-214). */
export type LiveTicket = Schema<"LiveTicket">;

/** Signals closer than this reach the screen as one reload. */
const MIN_RELOAD_GAP_MS = 1_000;
/** Waits before asking for a new ticket after the stream closed for good. */
const RETRY_DELAYS_MS = [5_000, 15_000, 60_000];

interface Listener {
  onChange: () => void;
  onConnected: (connected: boolean) => void;
}

interface Channel {
  listeners: Set<Listener>;
  connected: boolean;
  stop: () => void;
}

function hidden(): boolean {
  return document.visibilityState === "hidden";
}

/** One stream per topic, shared by every component of the page that follows it. */
const channels = new Map<string, Channel>();

function startChannel(apiUrl: string, getTicket: () => Promise<LiveTicket | null>): Channel {
  const channel: Channel = { listeners: new Set(), connected: false, stop: () => {} };
  let source: EventSource | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let reloadTimer: ReturnType<typeof setTimeout> | null = null;
  let lastReload = 0;
  let failures = 0;
  let stopped = false;

  function setConnected(connected: boolean) {
    channel.connected = connected;
    channel.listeners.forEach((listener) => listener.onConnected(connected));
  }

  function reload() {
    if (reloadTimer) return;
    const wait = Math.max(0, lastReload + MIN_RELOAD_GAP_MS - Date.now());
    reloadTimer = setTimeout(() => {
      reloadTimer = null;
      lastReload = Date.now();
      channel.listeners.forEach((listener) => listener.onChange());
    }, wait);
  }

  function close() {
    source?.close();
    source = null;
    setConnected(false);
    if (retryTimer) clearTimeout(retryTimer);
    retryTimer = null;
  }

  function retry() {
    if (stopped || retryTimer) return;
    const delay = RETRY_DELAYS_MS[Math.min(failures, RETRY_DELAYS_MS.length - 1)];
    failures += 1;
    retryTimer = setTimeout(() => {
      retryTimer = null;
      void open();
    }, delay);
  }

  async function open() {
    if (stopped || source || hidden()) return;
    const ticket = await getTicket().catch(() => null);
    if (stopped || source || hidden()) return;
    if (!ticket) {
      retry();
      return;
    }
    const stream = new EventSource(`${apiUrl}/live/stream?ticket=${encodeURIComponent(ticket.ticket)}`);
    source = stream;
    stream.addEventListener("ready", () => {
      failures = 0;
      setConnected(true);
    });
    stream.addEventListener("change", reload);
    stream.onerror = () => {
      if (stream.readyState === EventSource.CLOSED) {
        close();
        retry();
      } else {
        setConnected(false);
      }
    };
  }

  function onVisibility() {
    if (hidden()) {
      close();
    } else {
      reload();
      void open();
    }
  }

  void open();
  document.addEventListener("visibilitychange", onVisibility);
  channel.stop = () => {
    stopped = true;
    close();
    if (reloadTimer) clearTimeout(reloadTimer);
    document.removeEventListener("visibilitychange", onVisibility);
  };
  return channel;
}

/**
 * Follows a screen's topic on the live stream (JIKU-214) and calls [onChange]
 * each time something it shows changed. [topicKey] names what the screen
 * shows (an event id, a service id); components of a page with the same key
 * share one stream, it reopens when the key changes, and an empty key follows
 * nothing. [getTicket] asks the screen's own endpoint for a ticket, so the usual
 * access checks apply; it returns null when the screen may not follow live.
 * The stream closes while the tab is hidden and reopens, with one reload, when
 * it comes back. Returns whether the stream is open, so the caller can poll
 * slowly meanwhile and normally otherwise.
 */
export function useLiveSignal(
  topicKey: string,
  getTicket: () => Promise<LiveTicket | null>,
  onChange: () => void,
): boolean {
  const [connected, setConnected] = useState(false);
  const getTicketRef = useRef(getTicket);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    getTicketRef.current = getTicket;
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!topicKey || !apiUrl || typeof EventSource === "undefined") return;

    let channel = channels.get(topicKey);
    if (!channel) {
      channel = startChannel(apiUrl, () => getTicketRef.current());
      channels.set(topicKey, channel);
    }
    const listener: Listener = { onChange: () => onChangeRef.current(), onConnected: setConnected };
    channel.listeners.add(listener);
    setConnected(channel.connected);

    const joined = channel;
    return () => {
      joined.listeners.delete(listener);
      setConnected(false);
      if (joined.listeners.size === 0) {
        joined.stop();
        channels.delete(topicKey);
      }
    };
  }, [topicKey]);

  return connected;
}
