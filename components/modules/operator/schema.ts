import { z } from "zod";
import type { Schema } from "@/lib/api-contract";

// CONTRACT — an operator's console (JIKU-116): who they are, what they may do,
// and the events and services they work on.
export type OperatorConsoleView = Schema<"OperatorConsoleView">;
export type OperatorConsoleEvent = Schema<"OperatorConsoleEvent">;
export type OperatorConsoleService = Schema<"OperatorConsoleService">;

// The organizer's side (JIKU-116): the team of operators and what each works on.
export type OperatorTeamView = Schema<"OperatorTeamView">;
export type OperatorView = Schema<"OperatorView">;
export type OperatorAction = OperatorView["actions"][number];

export const OPERATOR_ACTIONS: OperatorAction[] = ["CHECK_IN", "QUEUE", "COLLECT"];

/** An event or a service an operator can be given. */
export interface ScopeChoice {
  id: string;
  name: string;
}

export const operatorSchema = z.object({
  label: z.string().trim().min(1, "required").max(80, "tooLong"),
  eventIds: z.array(z.string()),
  serviceIds: z.array(z.string()),
  actions: z.array(z.enum(["CHECK_IN", "QUEUE", "COLLECT"])).min(1, "required"),
});

export type OperatorInput = z.infer<typeof operatorSchema>;
