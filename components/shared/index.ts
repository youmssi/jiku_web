// Shared types, utilities, and cross-role components
// Will be populated as shared logic is extracted across route groups

export type Role = "organizer" | "guest" | "validator";

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
