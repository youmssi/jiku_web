import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware navigation primitives. Use these everywhere in app code instead
 * of the equivalents from next/link and next/navigation so the active locale
 * prefix is preserved on every link, push, replace, and redirect. The default
 * locale (no prefix) is handled transparently.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
