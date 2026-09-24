"use client";

import { useMemo, useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableFeatures } from "@/components/ui/data-table-features";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { TicketTypeResponse } from "@/components/modules/event";
import { readableTextColor } from "@/lib/color-contrast";
import { INVITATION_CHANNELS, INVITATION_CHANNEL_LABELS, type InvitationChannel } from "@/lib/channels";
import { attendanceCertificateRoute } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import { formatAmount } from "@/lib/currency";
import {
  markGuestPaidAction,
  removeGuestAction,
  setGuestExclusionAction,
  setGuestTicketTypeAction,
} from "@/components/modules/guest/guest.service";
import {
  PAYMENT_METHODS,
  type PaymentMethod,
  type RsvpStatus,
  type TicketPaymentStatus,
} from "@/components/modules/guest/schema";

export interface GuestRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  excludedFromInvitations: boolean;
  /** When the guest came in; decides whether a certificate can be issued (JIKU-95). */
  checkedInAt: string | null;
  ticketTypeId: string | null;
  rsvpStatus: RsvpStatus;
  ticketCode: string | null;
  paymentStatus: TicketPaymentStatus | null;
  amountDueMinor: number | null;
  amountDueCurrency: string | null;
  invitations: Record<string, string | null>;
}

type ResponseFilter = "ALL" | "CONFIRMED" | "PENDING" | "DECLINED" | "PAYMENT_DUE";

const ALL_CATEGORIES = "ALL";

function matchesResponse(row: GuestRow, filter: ResponseFilter): boolean {
  if (filter === "ALL") return true;
  if (filter === "PAYMENT_DUE") return row.paymentStatus === "DUE";
  return row.rsvpStatus === filter;
}

const RSVP_VARIANTS: Record<RsvpStatus, "default" | "secondary" | "outline" | "destructive"> = {
  CONFIRMED: "default",
  PENDING: "outline",
  DECLINED: "secondary",
  TRANSFERRED: "secondary",
};

/**
 * The guest list: search by name or contact, filter by answer (with counts) and
 * by category, and act on a guest from its row. The payment column appears
 * only when the event sells tickets, the category column only when it has
 * categories: most events have neither, and a column of dashes helps no one.
 */
export function GuestsTable({
  eventId,
  rows,
  ticketTypes,
}: {
  eventId: string;
  rows: GuestRow[];
  ticketTypes: TicketTypeResponse[];
}) {
  const t = useTranslations("guests");
  const format = useFormatter();
  const [response, setResponse] = useState<ResponseFilter>("ALL");
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [query, setQuery] = useState("");
  const sellsTickets = rows.some((row) => row.paymentStatus && row.paymentStatus !== "NOT_REQUIRED");

  const counts = useMemo(
    () => ({
      ALL: rows.length,
      CONFIRMED: rows.filter((row) => matchesResponse(row, "CONFIRMED")).length,
      PENDING: rows.filter((row) => matchesResponse(row, "PENDING")).length,
      DECLINED: rows.filter((row) => matchesResponse(row, "DECLINED")).length,
      PAYMENT_DUE: rows.filter((row) => matchesResponse(row, "PAYMENT_DUE")).length,
    }),
    [rows],
  );
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter(
      (row) =>
        matchesResponse(row, response) &&
        (category === ALL_CATEGORIES || row.ticketTypeId === category) &&
        (!needle || [row.name, row.email, row.phone].some((value) => value?.toLowerCase().includes(needle))),
    );
  }, [rows, response, category, query]);
  const byTypeId = useMemo(() => new Map(ticketTypes.map((type) => [type.id, type])), [ticketTypes]);

  const columns = useMemo<ColumnDef<DataTableFeatures, GuestRow>[]>(() => {
    const byId = new Map(ticketTypes.map((type) => [type.id, type]));
    return [
      {
        id: "name",
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <Button variant="ghost" className="-ml-3" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            {t("columns.name")}
            <ArrowUpDown data-icon="inline-end" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex min-w-0 flex-col">
            <span className="flex items-center gap-2 font-medium">
              {row.original.name}
              {row.original.excludedFromInvitations ? <Badge variant="outline">{t("excluded")}</Badge> : null}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {row.original.email ?? row.original.phone ?? t("noContact")}
            </span>
          </div>
        ),
      },
      {
        id: "response",
        header: t("columns.response"),
        enableSorting: false,
        cell: ({ row }) =>
          row.original.checkedInAt ? (
            <Badge variant="default">
              {t("checkedInAt", {
                time: format.dateTime(new Date(row.original.checkedInAt), { hour: "2-digit", minute: "2-digit" }),
              })}
            </Badge>
          ) : (
            <Badge variant={RSVP_VARIANTS[row.original.rsvpStatus]}>{t(`rsvp.${row.original.rsvpStatus}`)}</Badge>
          ),
      },
      ...(ticketTypes.length > 0
        ? [
            {
              id: "category",
              header: t("columns.category"),
              enableSorting: false,
              cell: ({ row }) => {
                const type = row.original.ticketTypeId ? byId.get(row.original.ticketTypeId) : undefined;
                return type ? (
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: type.colorHex, color: readableTextColor(type.colorHex) }}
                  >
                    {type.label}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                );
              },
            } satisfies ColumnDef<DataTableFeatures, GuestRow>,
          ]
        : []),
      ...(sellsTickets
        ? [
            {
              id: "payment",
              header: t("columns.payment"),
              enableSorting: false,
              cell: ({ row }) => <PaymentBadge row={row.original} />,
            } satisfies ColumnDef<DataTableFeatures, GuestRow>,
          ]
        : []),
      {
        id: "invitation",
        header: t("columns.invitation"),
        enableSorting: false,
        cell: ({ row }) => <InvitationBadges invitations={row.original.invitations} />,
      },
      {
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <GuestRowActions eventId={eventId} guest={row.original} ticketTypes={ticketTypes} />
          </div>
        ),
      },
    ];
  }, [eventId, ticketTypes, sellsTickets, t, format]);

  const filters: ResponseFilter[] = sellsTickets
    ? ["ALL", "CONFIRMED", "PENDING", "DECLINED", "PAYMENT_DUE"]
    : ["ALL", "CONFIRMED", "PENDING", "DECLINED"];

  return (
    <div className="flex flex-col gap-3">
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        value={response}
        onValueChange={(value) => value && setResponse(value as ResponseFilter)}
        aria-label={t("filters.label")}
        className="flex-wrap"
      >
        {filters.map((filter) => (
          <ToggleGroupItem key={filter} value={filter}>
            {t(`filters.${filter}`)}
            <span className="text-muted-foreground tabular-nums">{counts[filter]}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <GuestsToolbar
        query={query}
        onQuery={setQuery}
        ticketTypes={ticketTypes}
        category={category}
        onCategory={setCategory}
      />
      <div className="hidden md:block">
        <DataTable columns={columns} data={visible} />
      </div>
      <GuestCards eventId={eventId} rows={visible} ticketTypes={ticketTypes} byTypeId={byTypeId} sellsTickets={sellsTickets} />
    </div>
  );
}

const CARD_PAGE = 30;

/**
 * The guest list on a phone: one card per guest with what matters at a glance
 * (answer, category, what is owed) and the same row menu, instead of a table
 * that would scroll sideways.
 */
function GuestCards({
  eventId,
  rows,
  ticketTypes,
  byTypeId,
  sellsTickets,
}: {
  eventId: string;
  rows: GuestRow[];
  ticketTypes: TicketTypeResponse[];
  byTypeId: Map<string, TicketTypeResponse>;
  sellsTickets: boolean;
}) {
  const t = useTranslations("guests");
  const format = useFormatter();
  const [shown, setShown] = useState(CARD_PAGE);
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground md:hidden">{t("noMatch")}</p>;
  }
  return (
    <div className="flex flex-col gap-2 md:hidden">
      <ItemGroup className="gap-2">
        {rows.slice(0, shown).map((row) => {
          const type = row.ticketTypeId ? byTypeId.get(row.ticketTypeId) : undefined;
          return (
            <Item key={row.id} variant="outline" size="sm">
              <ItemContent>
                <ItemTitle>
                  {row.name}
                  {row.excludedFromInvitations ? <Badge variant="outline">{t("excluded")}</Badge> : null}
                </ItemTitle>
                <ItemDescription>{row.email ?? row.phone ?? t("noContact")}</ItemDescription>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {row.checkedInAt ? (
                    <Badge>
                      {t("checkedInAt", {
                        time: format.dateTime(new Date(row.checkedInAt), { hour: "2-digit", minute: "2-digit" }),
                      })}
                    </Badge>
                  ) : (
                    <Badge variant={RSVP_VARIANTS[row.rsvpStatus]}>{t(`rsvp.${row.rsvpStatus}`)}</Badge>
                  )}
                  {type ? (
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: type.colorHex, color: readableTextColor(type.colorHex) }}
                    >
                      {type.label}
                    </span>
                  ) : null}
                  {sellsTickets && row.paymentStatus ? <PaymentBadge row={row} /> : null}
                </div>
              </ItemContent>
              <ItemActions>
                <GuestRowActions eventId={eventId} guest={row} ticketTypes={ticketTypes} />
              </ItemActions>
            </Item>
          );
        })}
      </ItemGroup>
      {rows.length > shown ? (
        <Button variant="outline" onClick={() => setShown((count) => count + CARD_PAGE)}>
          {t("showMore", { count: rows.length - shown })}
        </Button>
      ) : null}
    </div>
  );
}

function GuestsToolbar({
  query,
  onQuery,
  ticketTypes,
  category,
  onCategory,
}: {
  query: string;
  onQuery: (value: string) => void;
  ticketTypes: TicketTypeResponse[];
  category: string;
  onCategory: (value: string) => void;
}) {
  const t = useTranslations("guests");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="w-full sm:max-w-sm sm:flex-1">
        <InputGroupInput
          type="search"
          placeholder={t("search")}
          aria-label={t("search")}
          value={query}
          onChange={(event) => onQuery(event.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
      {ticketTypes.length > 0 ? (
        <Select value={category} onValueChange={onCategory}>
          <SelectTrigger className="w-full sm:w-48" aria-label={t("columns.category")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>{t("allCategories")}</SelectItem>
            {ticketTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  );
}

function PaymentBadge({ row }: { row: GuestRow }) {
  const t = useTranslations("guests.payment");
  switch (row.paymentStatus) {
    case "DUE":
      return (
        <Badge variant="secondary">
          {row.amountDueMinor && row.amountDueCurrency
            ? t("due", { amount: formatAmount(row.amountDueMinor, row.amountDueCurrency) })
            : t("dueNoAmount")}
        </Badge>
      );
    case "PAID":
      return <Badge variant="default">{t("paid")}</Badge>;
    case "NOT_REQUIRED":
      return <span className="text-xs text-muted-foreground">{t("free")}</span>;
    default:
      return <span className="text-muted-foreground">—</span>;
  }
}

function InvitationBadges({ invitations }: { invitations: Record<string, string | null> }) {
  const t = useTranslations("guests.invitation");
  const reached = INVITATION_CHANNELS.filter((channel) => invitations[channel]);
  if (reached.length === 0) {
    return <span className="text-xs text-muted-foreground">{t("notSent")}</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {reached.map((channel: InvitationChannel) => {
        const status = invitations[channel] ?? "";
        const known = status === "SENT" || status === "FAILED" || status === "PENDING" || status === "QUEUED";
        return (
          <Badge key={channel} variant={status === "FAILED" ? "destructive" : status === "SENT" ? "outline" : "secondary"}>
            {INVITATION_CHANNEL_LABELS[channel]} · {known ? t(status) : status}
          </Badge>
        );
      })}
    </div>
  );
}

function GuestRowActions({
  eventId,
  guest,
  ticketTypes,
}: {
  eventId: string;
  guest: GuestRow;
  ticketTypes: TicketTypeResponse[];
}) {
  const t = useTranslations("guests.actions");
  const tCommon = useTranslations("common.actions");
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(success);
    });
  }

  function markPaid(method: PaymentMethod) {
    if (!guest.ticketCode) return;
    const code = guest.ticketCode;
    run(async () => {
      const result = await markGuestPaidAction(eventId, code, method);
      if (result.ok) trackEvent("ticket_marked_paid", { method });
      return result;
    }, t("paidDone", { name: guest.name }));
  }

  function setCategory(type: TicketTypeResponse | null) {
    run(
      () => setGuestTicketTypeAction(eventId, guest.id, type?.id ?? null),
      type ? t("categoryDone", { name: guest.name, category: type.label }) : t("categoryCleared", { name: guest.name }),
    );
  }

  function toggleExclusion() {
    run(
      () => setGuestExclusionAction(eventId, guest.id, !guest.excludedFromInvitations),
      guest.excludedFromInvitations ? t("includedDone", { name: guest.name }) : t("excludedDone", { name: guest.name }),
    );
  }

  function remove() {
    startTransition(async () => {
      const result = await removeGuestAction(eventId, guest.id);
      setConfirmOpen(false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("removedDone", { name: guest.name }));
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending} aria-label={t("label", { name: guest.name })}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {guest.paymentStatus === "DUE" && guest.ticketCode ? (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t("markPaid")}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {PAYMENT_METHODS.map((method) => (
                    <DropdownMenuItem key={method} onSelect={() => markPaid(method)}>
                      {t(`methods.${method}`)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {ticketTypes.length > 0 ? (
            <>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>{t("category")}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuLabel>{t("category")}</DropdownMenuLabel>
                  {ticketTypes.map((type) => (
                    <DropdownMenuItem
                      key={type.id}
                      disabled={type.id === guest.ticketTypeId}
                      onSelect={() => setCategory(type)}
                    >
                      <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: type.colorHex }} />
                      {type.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem disabled={guest.ticketTypeId === null} onSelect={() => setCategory(null)}>
                    {t("noCategory")}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
            </>
          ) : null}
          {guest.checkedInAt ? (
            <DropdownMenuItem asChild>
              <a href={attendanceCertificateRoute(eventId, guest.id)} download>
                {t("certificate")}
              </a>
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onSelect={toggleExclusion}>
            {guest.excludedFromInvitations ? t("include") : t("exclude")}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              setConfirmOpen(true);
            }}
          >
            {t("remove")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeTitle", { name: guest.name })}</AlertDialogTitle>
            <AlertDialogDescription>{t("removeDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={(event) => {
                event.preventDefault();
                remove();
              }}
              disabled={isPending}
            >
              {isPending ? t("removing") : t("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
