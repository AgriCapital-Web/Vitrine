/** Neutralise spreadsheet formulas (=, +, -, @, tab, CR) and escape a CSV cell. */
export function safeCsvValue(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s;
}
export function csvCell(value: unknown): string {
  return `"${safeCsvValue(value).replace(/"/g, '""')}"`;
}
