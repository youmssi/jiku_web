"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Copy, Pencil, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
          <p className="mt-2 text-sm">{t("seats", { count: seats })}</p>
        </div>
        <Button onClick={() => setEditing("new")}>
          <Plus className="size-4" />
          {t("add")}
        </Button>
      </div>

      {operators.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.name")}</TableHead>
                <TableHead>{t("columns.scope")}</TableHead>
                <TableHead>{t("columns.actions")}</TableHead>
                <TableHead className="text-right">{t("columns.link")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operators.map((operator) => (
                <TableRow key={operator.id} className={operator.revoked ? "opacity-60" : undefined}>
                  <TableCell>
                    <div className="font-medium">{operator.label}</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {operator.revoked ? <Badge variant="outline">{t("revoked")}</Badge> : null}
                      {operator.billable ? <Badge variant="secondary">{t("billable")}</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-56 whitespace-normal text-sm">
                    {operator.events.length + operator.services.length === 0
                      ? t("nothingAssigned")
                      : [...operator.events, ...operator.services].map((item) => item.name).join(", ")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {operator.actions.map((action) => (
                        <Badge key={action} variant="outline">
                          {a(action)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {operator.revoked ? null : (
                      <div className="flex justify-end gap-1">
                        {operator.link ? (
                          <Button size="icon-sm" variant="outline" onClick={() => void copy(operator.link ?? "")}>
                            <Copy className="size-3.5" />
                            <span className="sr-only">{t("copy")}</span>
                          </Button>
                        ) : null}
                        <Button size="icon-sm" variant="outline" onClick={() => setEditing(operator)}>
                          <Pencil className="size-3.5" />
                          <span className="sr-only">{t("edit")}</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              {t("revoke")}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t("revoke")}</AlertDialogTitle>
                              <AlertDialogDescription>{t("revokeConfirm", { name: operator.label })}</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t("form.cancel")}</AlertDialogCancel>
                              <AlertDialogAction onClick={() => void revoke(operator)}>{t("revoke")}</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
