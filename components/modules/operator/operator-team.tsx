"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Copy, MoreHorizontal, Pencil, Plus, XCircle } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { FormFieldError } from "@/components/shared";
import {
  createOperatorAction,
  revokeOperatorAction,
  updateOperatorAction,
} from "@/components/modules/operator/operator.service";
import {
  OPERATOR_ACTIONS,
  operatorSchema,
  type OperatorInput,
  type OperatorTeamView,
  type OperatorView,
  type ScopeChoice,
} from "@/components/modules/operator/schema";

/**
 * The organizer's operators (JIKU-116): who runs which door or line, what they
 * may do, and their single link to copy and send. Revoking stops the link at
 * once; an operator on a service takes a seat of the subscription.
 */
export function OperatorTeam({
  initial,
  events,
  services,
}: {
  initial: OperatorTeamView;
  events: ScopeChoice[];
  services: ScopeChoice[];
}) {
  const t = useTranslations("operator.team");
  const a = useTranslations("operator.console.actions");
  const [operators, setOperators] = useState<OperatorView[]>(initial.operators);
  const [editing, setEditing] = useState<OperatorView | "new" | null>(null);
  const [revoking, setRevoking] = useState<OperatorView | null>(null);
  const seats = operators.filter((operator) => operator.billable).length;

  function upsert(saved: OperatorView) {
    setOperators((list) =>
      list.some((operator) => operator.id === saved.id)
        ? list.map((operator) => (operator.id === saved.id ? saved : operator))
        : [saved, ...list],
    );
  }

  async function copy(link: string) {
    await navigator.clipboard.writeText(link);
    toast.success(t("copied"));
  }

  async function revoke(operator: OperatorView) {
    const result = await revokeOperatorAction(operator.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    upsert(result.data);
    toast.success(t("revokedToast"));
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xl">
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          {seats > 0 ? <p className="mt-2 text-sm">{t("seats", { count: seats })}</p> : null}
        </div>
        <Button onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          {t("add")}
        </Button>
      </div>

      {operators.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ItemGroup className="gap-2">
          {operators.map((operator) => (
            <Item key={operator.id} variant="outline" role="listitem" className={operator.revoked ? "opacity-60" : undefined}>
              <ItemContent className="min-w-0">
                <ItemTitle className="flex flex-wrap items-center gap-2">
                  {operator.label}
                  {operator.revoked ? <Badge variant="outline">{t("revoked")}</Badge> : null}
                  {operator.billable ? <Badge variant="secondary">{t("billable")}</Badge> : null}
                </ItemTitle>
                <ItemDescription className="line-clamp-none">
                  {operator.events.length + operator.services.length === 0
                    ? t("nothingAssigned")
                    : [...operator.events, ...operator.services].map((item) => item.name).join(", ")}
                  {" · "}
                  {operator.actions.map((action) => a(action)).join(", ")}
                </ItemDescription>
              </ItemContent>
              {operator.revoked ? null : (
                <ItemActions className="max-sm:basis-full max-sm:justify-end">
                  {operator.link ? (
                    <Button variant="outline" onClick={() => void copy(operator.link ?? "")}>
                      <Copy aria-hidden />
                      {t("copy")}
                    </Button>
                  ) : null}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={t("more", { name: operator.label })}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setEditing(operator)}>
                        <Pencil aria-hidden />
                        {t("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => setRevoking(operator)}>
                        <XCircle aria-hidden />
                        {t("revoke")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ItemActions>
              )}
            </Item>
          ))}
        </ItemGroup>
      )}

      <AlertDialog open={revoking !== null} onOpenChange={(open) => (open ? null : setRevoking(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("revoke")}</AlertDialogTitle>
            <AlertDialogDescription>{t("revokeConfirm", { name: revoking?.label ?? "" })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("form.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => (revoking ? void revoke(revoking) : undefined)}>{t("revoke")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <OperatorDialog
        key={editing === null ? "closed" : editing === "new" ? "new" : editing.id}
        operator={editing}
        events={events}
        services={services}
        onClose={() => setEditing(null)}
        onSaved={(saved) => {
          upsert(saved);
          setEditing(null);
          toast.success(t("saved"));
        }}
        actionLabel={(action) => a(action)}
      />
    </div>
  );
}

function OperatorDialog({
  operator,
  events,
  services,
  onClose,
  onSaved,
  actionLabel,
}: {
  operator: OperatorView | "new" | null;
  events: ScopeChoice[];
  services: ScopeChoice[];
  onClose: () => void;
  onSaved: (saved: OperatorView) => void;
  actionLabel: (action: OperatorInput["actions"][number]) => string;
}) {
  const t = useTranslations("operator.team.form");
  const existing = operator && operator !== "new" ? operator : null;
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<OperatorInput>({
    resolver: zodResolver(operatorSchema),
    mode: "onTouched",
    defaultValues: {
      label: existing?.label ?? "",
      eventIds: existing?.events.map((item) => item.id) ?? [],
      serviceIds: existing?.services.map((item) => item.id) ?? [],
      actions: existing?.actions ?? ["CHECK_IN"],
    },
  });

  async function onSubmit(values: OperatorInput) {
    setError(null);
    const result = existing ? await updateOperatorAction(existing.id, values) : await createOperatorAction(values);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved(result.data);
  }

  return (
    <Dialog open={operator !== null} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{existing ? t("editTitle") : t("createTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name="label"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="operator-label">{t("label")}</FieldLabel>
                  <Input {...field} id="operator-label" aria-invalid={fieldState.invalid} />
                  <FieldDescription>{t("labelHelp")}</FieldDescription>
                  <FormFieldError error={fieldState.error} />
                </Field>
              )}
            />
            <Controller
              control={control}
              name="actions"
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend variant="label">{t("actions")}</FieldLegend>
                  {OPERATOR_ACTIONS.map((action) => (
                    <Field key={action} orientation="horizontal">
                      <Checkbox
                        id={`operator-action-${action}`}
                        checked={field.value.includes(action)}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? [...field.value, action] : field.value.filter((a) => a !== action))
                        }
                      />
                      <FieldLabel htmlFor={`operator-action-${action}`} className="font-normal">
                        {actionLabel(action)}
                      </FieldLabel>
                    </Field>
                  ))}
                  <FormFieldError error={fieldState.error} />
                </FieldSet>
              )}
            />
            <ScopePicker control={control} name="eventIds" legend={t("events")} empty={t("noEvents")} choices={events} />
            <ScopePicker
              control={control}
              name="serviceIds"
              legend={t("services")}
              empty={t("noServices")}
              choices={services}
              note={t("servicesNote")}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ScopePicker({
  control,
  name,
  legend,
  empty,
  choices,
  note,
}: {
  control: ReturnType<typeof useForm<OperatorInput>>["control"];
  name: "eventIds" | "serviceIds";
  legend: string;
  empty: string;
  choices: ScopeChoice[];
  note?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FieldSet>
          <FieldLegend variant="label">{legend}</FieldLegend>
          {note ? <FieldDescription>{note}</FieldDescription> : null}
          {choices.length === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : null}
          <div className="grid max-h-48 gap-2 overflow-y-auto">
            {choices.map((choice) => (
              <Field key={choice.id} orientation="horizontal">
                <Checkbox
                  id={`${name}-${choice.id}`}
                  checked={field.value.includes(choice.id)}
                  onCheckedChange={(checked) =>
                    field.onChange(checked ? [...field.value, choice.id] : field.value.filter((id) => id !== choice.id))
                  }
                />
                <FieldLabel htmlFor={`${name}-${choice.id}`} className="font-normal">
                  {choice.name}
                </FieldLabel>
              </Field>
            ))}
          </div>
        </FieldSet>
      )}
    />
  );
}
