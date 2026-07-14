import { z } from "zod";

/** Backend MemberView (JIKU-50). */
export interface MemberView {
  userId: string;
  email: string;
  role: string;
  joinedAt: string;
}

/** Backend InvitationView — a pending invitation (JIKU-50). */
export interface InvitationView {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

/** OWNER is granted through a later role change by an owner, never at the door. */
export const INVITABLE_ROLES = ["ADMIN", "MEMBER"] as const;
export const ASSIGNABLE_ROLES = ["OWNER", "ADMIN", "MEMBER"] as const;

export const inviteMemberSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(INVITABLE_ROLES),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
