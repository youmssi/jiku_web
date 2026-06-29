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
}

export interface EntranceCount {
  label: string;
  checkedIn: number;
}
