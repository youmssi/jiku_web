/** Live dashboard metrics for one event (mirrors the backend DashboardResponse). */
export interface DashboardData {
  eventName: string;
  eventStatus: string;
  totalGuests: number;
  invited: number;
  confirmed: number;
  declined: number;
  pending: number;
  checkedIn: number;
  entrances: EntranceCount[];
  deliverability: DeliverabilityFlag;
}

export interface EntranceCount {
  label: string;
  checkedIn: number;
}

export interface DeliverabilityFlag {
  bounceRatePercent: number;
  warn: boolean;
}
