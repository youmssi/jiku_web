"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { Spinner } from "@/components/ui/spinner";
import {
  createValidatorLink,
  listValidatorLinks,
  revokeValidatorLink,
  type ValidatorLink,
} from "@/components/modules/checkin/validator-links.service";

/**
 * Liens de portier d'un événement (organisateur) : chaque point d'entrée a son lien
 * partagé, montré une seule fois à la création, révocable à tout moment (un portier
 * qui part perd l'accès immédiatement). Les comptages par entrée du tableau de bord
 * reflètent ces liens (label).
 */
export function ValidatorLinks({ eventId }: { eventId: string }) {
  const [links, setLinks] = useState<ValidatorLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [freshLink, setFreshLink] = useState<string | null>(null);

  async function refresh() {
    const result = await listValidatorLinks(eventId);
    if (result.ok) {
      setLinks(result.data);
      setLoading(false);
    } else {
      toast.error(result.error);
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    listValidatorLinks(eventId).then((result) => {
      if (!active) return;
      if (result.ok) setLinks(result.data);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [eventId]);

  async function submitCreate() {
    const trimmed = label.trim();
    if (!trimmed) return;
    setCreating(true);
    const result = await createValidatorLink(eventId, trimmed);
    setCreating(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setLabel("");
    setDialogOpen(false);
    setFreshLink(result.data.link);
    await refresh();
  }

  async function revoke(validatorId: string, linkLabel: string) {
    const result = await revokeValidatorLink(eventId, validatorId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Le lien « ${linkLabel} » a été révoqué.`);
    await refresh();
  }

  async function copy(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Lien copié dans le presse-papiers.");
    } catch {
      toast.error("Impossible de copier le lien.");
    }
  }

  return (
    <div className="rounded-xl border p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Door links</p>
          <p className="text-xs text-muted-foreground">
            One link per entrance, given to the door person. Revoke to cut access.
          </p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          New link
        </Button>
      </div>

      {freshLink ? (
        <div className="mt-4 rounded-lg border border-green-600/30 bg-green-50 p-3 text-sm text-green-900 dark:bg-green-950/30 dark:text-green-200">
          <p className="font-medium">Lien créé — montrez-le une seule fois :</p>
          <p className="mt-1 break-all font-mono text-xs">{freshLink}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={() => copy(freshLink)}>
            Copier le lien
          </Button>
        </div>
      ) : null}

      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : links.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">
            No door links yet — create one and share it with the entrance staff.
          </p>
        ) : (
          <ul className="divide-y">
            {links.map((link) => (
              <li key={link.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>{link.label}</span>
                  {link.revoked ? (
                    <Badge variant="outline">révoqué</Badge>
                  ) : (
                    <Badge>actif</Badge>
                  )}
                </div>
                {!link.revoked ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => revoke(link.id, link.label)}
                    >
                      Revoke
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau lien de portier</DialogTitle>
            <DialogDescription>
              Nommez le point d&apos;entrée (ex. « Entrée principale », « VIP ») — le lien
              sera montré une seule fois.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="validator-label">Nom de l&apos;entrée</FieldLabel>
            <Input
              id="validator-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Entrée principale"
            />
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={submitCreate} disabled={creating || !label.trim()}>
              Créer le lien
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
