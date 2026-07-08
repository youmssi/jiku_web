import type { Schema } from "@/lib/api-contract";

/** Live dashboard metrics for one event (backend DashboardResponse). */
export type DashboardData = Schema<"DashboardResponse">;
export type EntranceCount = Schema<"EntranceCount">;
export type DeliverabilityFlag = Schema<"DeliverabilityFlag">;
