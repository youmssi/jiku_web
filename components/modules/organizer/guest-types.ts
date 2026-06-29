export interface RowIssue {
  row: number;
  reason: string;
}

export interface ImportResult {
  imported: number;
  skippedDuplicates: number;
  failed: number;
  failures: RowIssue[];
  warnings: RowIssue[];
}
