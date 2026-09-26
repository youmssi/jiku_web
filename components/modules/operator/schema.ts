import type { Schema } from "@/lib/api-contract";

// CONTRACT — an operator's console (JIKU-116): who they are, what they may do,
// and the events and services they work on.
export type OperatorConsoleView = Schema<"OperatorConsoleView">;
export type OperatorConsoleEvent = Schema<"OperatorConsoleEvent">;
export type OperatorConsoleService = Schema<"OperatorConsoleService">;
