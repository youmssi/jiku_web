/**
 * The path without its leading locale segment, when it has one: `/en/events/42`
 * becomes `/events/42` and `/en` becomes `/`. Query and hash are kept. A path
 * meant for a locale-aware redirect must not carry the locale already, or the
 * redirect adds it a second time (`/en/en/events/42`, JIKU-310).
 */
export function withoutLocalePrefix(path: string, locales: readonly string[]): string {
  for (const locale of locales) {
    const prefix = `/${locale}`;
    if (path === prefix) return "/";
    if (path.startsWith(prefix) && /^[/?#]/.test(path.slice(prefix.length))) {
      const rest = path.slice(prefix.length);
      return rest.startsWith("/") ? rest : `/${rest}`;
    }
  }
  return path;
}
