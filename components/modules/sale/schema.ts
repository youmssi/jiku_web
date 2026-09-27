import { z } from "zod";
import type { Schema } from "@/lib/api-contract";

// CONTRACT — public ticket sales (JIKU-177): the sale page, an order, and the
// organization's view of its orders.

export type PublicSale = Schema<"PublicSaleView">;
export type SaleCategory = Schema<"PublicSaleCategoryView">;
export type SaleClosedReason = NonNullable<PublicSale["closedReason"]>;
export type Order = Schema<"OrderView">;
export type PlacedOrder = Schema<"PlacedOrderView">;
export type OrderStatus = Order["status"];
export type OrganizerOrder = Schema<"OrganizerOrderView">;
export type SalesSettings = Schema<"SalesSettingsView">;

/** What the buyer fills in; messages are `common.validation` keys. */
export const checkoutSchema = z.object({
  quantities: z.record(z.string(), z.number().int().min(0)),
  buyerName: z.string().trim().min(1, "required").min(2, "tooShort").max(120, "tooLong"),
  buyerPhone: z
    .string()
    .transform((value) => value.replace(/\s+/g, ""))
    .pipe(z.string().regex(/^\+[1-9][0-9]{7,14}$/, "phone")),
  buyerEmail: z.union([z.literal(""), z.string().trim().email("email").max(254, "tooLong")]),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;

export const declareSchema = z.object({
  paymentReference: z.string().trim().min(3, "tooShort").max(80, "tooLong"),
});

export type DeclareInput = z.infer<typeof declareSchema>;

export const rejectSchema = z.object({
  reason: z.string().trim().min(3, "tooShort").max(300, "tooLong"),
});

export type RejectInput = z.infer<typeof rejectSchema>;

/** The hold an organization picks, in minutes, within the platform's bounds. */
export function holdSchema(min: number, max: number) {
  return z.object({ minutes: z.number().int("wholeNumber").min(min, "outOfRange").max(max, "outOfRange") });
}

export type HoldInput = z.infer<ReturnType<typeof holdSchema>>;

// ─── Commission on tickets sold (JIKU-178) ───────────────────────────────────

export type CommissionOverview = Schema<"CommissionOverview">;
export type CommissionCategory = Schema<"CommissionCategoryView">;
export type CommissionQuote = Schema<"CommissionQuote">;
export type OpenedBatch = Schema<"OpenedBatchView">;
export type BatchMode = "FREE" | "CREDIT" | "PAY";
