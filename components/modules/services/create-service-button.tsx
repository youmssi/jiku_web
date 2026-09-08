"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SERVICE_TIMEZONES } from "@/components/modules/services/schema";
import { createServiceAction } from "@/components/modules/services/services.service";

/** Création d'un service (nom + fuseau) ; la liste est rechargée après succès. */
export function CreateServiceButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState<string>(SERVICE_TIMEZONES[0]);
  const [pending, startTransition] = useTransition();

  function submit() {
    const trimmed = name.trim();
    if (!trimmed || !timezone) return;
    startTransition(async () => {
      const result = await createServiceAction(trimmed, timezone);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Service créé.");
      setOpen(false);
      setName("");
      router.refresh();
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Nouveau service</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau service</DialogTitle>
            <DialogDescription>
              Un service = ce que vous vendez (ex. « Coupe », « Coloration »). Vous lui
              ajouterez ensuite ses horaires et ses ressources.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Field>
              <FieldLabel htmlFor="service-name">Nom</FieldLabel>
              <Input
                id="service-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Coupe"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="service-timezone">Fuseau horaire</FieldLabel>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="service-timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TIMEZONES.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submit} disabled={pending || !name.trim()}>
              Créer le service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
