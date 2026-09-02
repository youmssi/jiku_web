// CONTRAT — liste d'accès anticipé rendez-vous (JIKU-98).
//
// Les types sont écrits ici et non aliasés du contrat généré : le point d'API est
// public et non authentifié, donc absent du client typé côté organisateur. À
// aligner sur `ProspectLeadRequest` côté backend.

export const PROSPECT_SECTORS = [
  { value: "COUTURE", label: "Couture, retouches" },
  { value: "COIFFURE_BEAUTE", label: "Coiffure, beauté" },
  { value: "PHOTOGRAPHIE", label: "Photographie, vidéo" },
  { value: "TRAITEUR", label: "Traiteur, pâtisserie" },
  { value: "SALLE_RECEPTION", label: "Salle de réception" },
  { value: "SANTE", label: "Cabinet, clinique" },
  { value: "RESTAURATION", label: "Restauration" },
  { value: "AUTRE", label: "Autre activité" },
] as const;

export const WEEKLY_VOLUMES = [
  { value: "MOINS_10", label: "Moins de 10 par semaine" },
  { value: "10_30", label: "10 à 30 par semaine" },
  { value: "30_100", label: "30 à 100 par semaine" },
  { value: "PLUS_100", label: "Plus de 100 par semaine" },
] as const;

export interface ProspectLeadRequest {
  businessName: string;
  contactName: string;
  phone: string;
  sector: string;
  email?: string | null;
  city?: string | null;
  weeklyVolume?: string | null;
  note?: string | null;
  source?: string | null;
}
