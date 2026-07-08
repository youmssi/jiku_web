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
  usage: UsageSummary;
}

/** Billing usage against the event's unlocked allowance (mirrors backend UsageSummary). */
export interface UsageSummary {
  invited: number;
  allowance: number;
  remaining: number;
  tier: string;
  withinAllowance: boolean;
}

export interface EntranceCount {
  label: string;
  checkedIn: number;
}

export interface DeliverabilityFlag {
  bounceRatePercent: number;
  warn: boolean;
}
