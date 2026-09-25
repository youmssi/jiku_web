/** A paragraph, or a bulleted list when the entry is an array. */
export type LegalBlock = string | readonly string[];

export interface LegalSection {
  /** Anchor for the table of contents and deep links. */
  id: string;
  heading: string;
  body: readonly LegalBlock[];
}

export interface LegalDocument {
  title: string;
  /** Meta description for search results. */
  description: string;
  intro: string;
  sections: readonly LegalSection[];
}

export type LegalDocumentId = "legal" | "terms" | "privacy";

export type LegalDocuments = Record<LegalDocumentId, LegalDocument>;
