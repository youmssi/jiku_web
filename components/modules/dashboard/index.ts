// Dashboard module — organizer event overview (live metrics, trend charts) and
// the organizer app shell (sidebar navigation).
export { AppSidebar } from "./app-sidebar";
export type { AppSidebarProps, SidebarProject } from "./app-sidebar";
export { AppBreadcrumb } from "./app-breadcrumb";
export { AttendanceDocuments } from "./attendance-documents";
export { QuorumCard } from "./quorum-card";
export { EventDashboard } from "./event-dashboard";
export { DashboardView } from "./dashboard-view";
export { useDashboard } from "./useDashboard";
export type {
  DashboardData,
  EntranceCount,
  DeliverabilityFlag,
  QuorumView,
  AnalyticsData,
  TimeBucket,
  ChannelBreakdown,
  DateCount,
} from "./schema";
