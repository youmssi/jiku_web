/**
 * The publisher's identity, quoted by every legal page, as registered with the
 * Conakry RCCM on 14 October 2026 and the tax administration. Changing a value
 * here updates the legal notice, the terms and the privacy policy at once. The
 * bracketed values are still to be provided.
 */
export const COMPANY = {
  legalName: "MRVIN100 SARLU",
  legalForm: "société à responsabilité limitée unipersonnelle",
  shareCapital: "2 000 000 GNF",
  rccm: "GN.TCC.2026.B.14483",
  nif: "814824199",
  address: "Kaporo Rails, commune de Ratoma, Conakry, République de Guinée",
  director: "Jean Vincent Youmssi Toguem",
  email: "[contact@domaine]",
  privacyEmail: "[confidentialite@domaine]",
  phone: "[+224 6XX XX XX XX]",
  dpaDeclaration: "[Référence de la déclaration auprès de l'autorité de protection des données]",
} as const;

/** Date the current versions took effect, shown at the top of every page. */
export const LEGAL_UPDATED = "2026-10-15";
