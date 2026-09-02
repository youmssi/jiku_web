import type { Schema } from "@/lib/api-contract";

/** Live dashboard metrics for one event (backend DashboardResponse). */
export type DashboardData = Schema<"DashboardResponse"> & {
  /** Data-retention warning, null when none is imminent. */
  dataRetention?: {
    /** ISO date when guest data will be anonymised. */
    anonymizeOn: string;
  } | null;
  /** Guest-allowance usage for the event, null below the free tier. */
  usage?: {
    withinAllowance: boolean;
    invited: number;
    allowance: number;
    tier: string;
    remaining: number;
  } | null;
};
export type EntranceCount = Schema<"EntranceCount">;
/** État du quorum d'assemblée générale (JIKU-94), absent si non configuré. */
export type QuorumView = Schema<"QuorumView">;
export type DeliverabilityFlag = Schema<"DeliverabilityFlag">;

/** Trend data shown alongside the live snapshot (backend AnalyticsResponse). */
export type AnalyticsData = Schema<"AnalyticsResponse">;
export type TimeBucket = Schema<"TimeBucket">;
export type ChannelBreakdown = Schema<"ChannelBreakdown">;
export type DateCount = Schema<"DateCount">;
