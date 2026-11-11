/**
 * The publisher's public identity, quoted by every legal page, as registered
 * with the Conakry RCCM on 14 October 2026. Only what a customer needs to know
 * who they deal with and how to reach them is published, as large software
 * publishers do: the company, its registration and registered office, and a
 * contact address. People's names, phone numbers and tax identifiers stay off
 * the public pages; invoices carry the tax details where the law requires
 * them. Changing a value here updates the legal notice, the terms and the
 * privacy policy at once. `dpaDeclaration` stays null until the data
 * protection authority issues its reference; the privacy policy leaves the
 * line out meanwhile.
 */
export const COMPANY = {
  legalName: "MRVIN100 SARLU",
  legalForm: "société à responsabilité limitée unipersonnelle",
  shareCapital: "2 000 000 GNF",
  rccm: "GN.TCC.2026.B.14483",
  address: "Kaporo Rails, commune de Ratoma, Conakry, République de Guinée",
  email: "contact@hellojiku.com",
  privacyEmail: "privacy@hellojiku.com",
  dpaDeclaration: null as string | null,
} as const;

/** Date the current versions took effect, shown at the top of every page. */
export const LEGAL_UPDATED = "2026-10-18";
