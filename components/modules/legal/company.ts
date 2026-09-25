/**
 * The publisher's identity, quoted by every legal page. The bracketed values are
 * placeholders until the company's registration papers are issued; replacing
 * them here updates the legal notice, the terms and the privacy policy at once.
 */
export const COMPANY = {
  legalName: "[Dénomination sociale]",
  legalForm: "[Forme juridique : SARL, SAS ou SA]",
  shareCapital: "[Capital social] GNF",
  rccm: "[N° RCCM : GN.TCC.AAAA.X.XXXXX]",
  nif: "[NIF]",
  address: "[Adresse du siège], Conakry, République de Guinée",
  director: "[Nom du représentant légal]",
  email: "[contact@domaine]",
  privacyEmail: "[confidentialite@domaine]",
  phone: "[+224 6XX XX XX XX]",
  dpaDeclaration: "[Référence de la déclaration auprès de l'autorité de protection des données]",
} as const;

/** Date the current versions took effect, shown at the top of every page. */
export const LEGAL_UPDATED = "2026-09-25";
