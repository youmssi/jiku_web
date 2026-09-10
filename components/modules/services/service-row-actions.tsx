"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  serviceConfigurationRoute,
  serviceLineRoute,
  serviceManageRoute,
} from "@/lib/constants";
import { deleteServiceAction, renameServiceAction } from "./services.service";
import type { ServiceSummary } from "./schema";

/**
 * Row actions for the services table: open the service's consoles, rename it,
 * or delete it. Deletion asks for confirmation and removes the service with all
 * of its data (slots, tickets, staff links).
 */
export function ServiceRowActions({ service }: { service: ServiceSummary }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [name, setName] = React.useState(service.name);

  function openRename() {
    setName(service.name);
    setRenameOpen(true);
  }

  function submitRename() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === service.name) {
      setRenameOpen(false);
      return;
    }
    startTransition(async () => {
      const result = await renameServiceAction(service.id, trimmed);
      setRenameOpen(false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Service renommé.");
      router.refresh();
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteServiceAction(service.id);
      setDeleteOpen(false);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Service supprimé.");
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={serviceManageRoute(service.id)}>Gérer</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={serviceConfigurationRoute(service.id)}>Configuration</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={serviceLineRoute(service.id)}>Ligne du jour</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={openRename}>Rename</DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDeleteOpen(true)}
          >
            Delete service
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renommer le service</DialogTitle>
            <DialogDescription>
              Le nom du service apparaît sur le lien de réservation et la ligne du jour.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="rename-service">Nom</FieldLabel>
            <Input
              id="rename-service"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submitRename} disabled={pending || !name.trim()}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {service.name} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le service, ses créneaux, ses billets et ses liens de comptoir seront
              supprimés définitivement. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={confirmDelete}
              disabled={pending}
            >
              {pending ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
