import { createNavigation } from "next-intl/navigation";

import { guestRouting } from "./routing";

/**
 * Locale-aware navigation primitives. Use these everywhere in app code instead
 * of the equivalents from next/link and next/navigation so the active locale
 * prefix is preserved on every link, push, replace, and redirect. The default
 * locale (no prefix) is handled transparently. Built on the guest routing so
 * a guest screen read in Arabic keeps its /ar prefix; the other screens never
 * run in Arabic, so their links never take it.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(guestRouting);
