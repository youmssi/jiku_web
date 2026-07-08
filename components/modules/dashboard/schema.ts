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
export type DeliverabilityFlag = Schema<"DeliverabilityFlag">;
