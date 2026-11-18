/** [value] as a web page address, or null: only an http(s) page is ever handed to the browser as a redirect. */
export function webPageUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
