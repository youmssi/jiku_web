"use client";

import { useCallback, useEffect, useState } from "react";
import { useLiveSignal } from "@/components/shared";
import { refreshQuietly } from "@/lib/refresh-quietly";
import {
  fetchNoticesAction,
  fetchNoticesLiveTicketAction,
  fetchUnreadNoticesAction,
  markAllNoticesReadAction,
  markNoticeReadAction,
} from "./notices.service";
import type { OrganizerNotice } from "./schema";

/** Without the live stream, how often the unread count is checked. */
const POLL_INTERVAL_MS = 30_000;
/** With it, a safety check for changes the stream cannot see. */
const LIVE_POLL_INTERVAL_MS = 5 * 60_000;
/** One bell per page; the organization never changes without a full navigation. */
const TOPIC_KEY = "notices";

type ListState = "idle" | "loading" | "ready" | "error";

/**
 * Cache layer for the notification bell (JIKU-314). The unread count follows
 * the live stream, with polling as the fallback; the list itself loads only
 * when the panel is open, and reloads when a notice lands while it is.
 */
export function useNotices(open: boolean) {
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<OrganizerNotice[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [state, setState] = useState<ListState>("idle");
  const [error, setError] = useState<string | null>(null);

  const reloadCount = useCallback(async () => {
    if (document.visibilityState === "hidden") return;
    const count = await fetchUnreadNoticesAction();
    if (count !== null) setUnread(count);
  }, []);

  const loadFirstPage = useCallback(async () => {
    setState((current) => (current === "ready" ? current : "loading"));
    const result = await fetchNoticesAction(0);
    if (result.ok) {
      setItems(result.data.items);
      setHasMore(result.data.hasMore);
      setUnread(result.data.unread);
      setPage(0);
      setState("ready");
      setError(null);
    } else {
      setState("error");
      setError(result.error);
    }
  }, []);

  const loadMore = useCallback(async () => {
    const next = page + 1;
    const result = await fetchNoticesAction(next);
    if (result.ok) {
      setItems((current) => [...current, ...result.data.items.filter((item) => !current.some((known) => known.id === item.id))]);
      setHasMore(result.data.hasMore);
      setPage(next);
    } else {
      setError(result.error);
    }
  }, [page]);

  const onChange = useCallback(() => {
    void refreshQuietly(open ? loadFirstPage : reloadCount);
  }, [open, loadFirstPage, reloadCount]);

  const live = useLiveSignal(TOPIC_KEY, fetchNoticesLiveTicketAction, onChange);

  useEffect(() => {
    void refreshQuietly(reloadCount);
    const timer = setInterval(() => void refreshQuietly(reloadCount), live ? LIVE_POLL_INTERVAL_MS : POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [reloadCount, live]);

  useEffect(() => {
    if (open) void refreshQuietly(loadFirstPage);
  }, [open, loadFirstPage]);

  const markRead = useCallback(async (noticeId: string) => {
    const target = items.find((item) => item.id === noticeId);
    if (!target || target.readAt) return;
    const result = await markNoticeReadAction(noticeId);
    if (result.ok) {
      setItems((current) => current.map((item) => (item.id === noticeId ? result.data : item)));
      setUnread((count) => Math.max(0, count - 1));
    }
  }, [items]);

  const markAllRead = useCallback(async () => {
    const result = await markAllNoticesReadAction();
    if (result.ok) {
      const now = new Date().toISOString();
      setItems((current) => current.map((item) => (item.readAt ? item : { ...item, readAt: now })));
      setUnread(0);
    } else {
      setError(result.error);
    }
  }, []);

  return { unread, items, hasMore, state, error, retry: loadFirstPage, loadMore, markRead, markAllRead };
}
