import type { Schema } from "@/lib/api-contract";

/** Trend data behind an event's analytics page (backend AnalyticsResponse). */
export type AnalyticsData = Schema<"AnalyticsResponse">;
export type TimeBucket = Schema<"TimeBucket">;
export type ChannelBreakdown = Schema<"ChannelBreakdown">;
export type DateCount = Schema<"DateCount">;
