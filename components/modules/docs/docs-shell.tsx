import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import { JikūLogo } from "@/components/ui/jiku-logo";
import type { Locale } from "@/i18n/routing";
import { DOCS_HOME_LABEL, DOCS_REGISTER_LABEL } from "./docs-labels";
import { DOCS_UI_TRANSLATIONS } from "./docs-translations";
import { docsSource } from "./source";

/**
 * The guides' frame (JIKU-235): Fumadocs' sidebar, search and table of
 * contents in the site's charter (its shadcn theme reads our tokens), the
 * logo back to the site, and the way to an account. The site has no dark
 * switch, so Fumadocs' theme toggle is off; the language link lives on each
 * page so it keeps the same guide.
 */
export function DocsShell({ locale, children }: Readonly<{ locale: Locale; children: ReactNode }>) {
  const home = locale === "fr" ? "/" : `/${locale}`;
  const register = locale === "fr" ? "/register" : `/${locale}/register`;

  return (
    <RootProvider
      theme={{ enabled: false }}
      i18n={{ locale, translations: DOCS_UI_TRANSLATIONS[locale] }}
      search={{ options: { api: "/api/docs-search" } }}
    >
      <DocsLayout
        tree={docsSource.getPageTree(locale)}
        nav={{
          title: (
            <span className="inline-flex items-center gap-2 font-semibold">
              <JikūLogo variant="mark" className="size-6" />
              Jikū
            </span>
          ),
          url: home,
        }}
        themeSwitch={{ enabled: false }}
        links={[
          { text: DOCS_HOME_LABEL[locale], url: home },
          { text: DOCS_REGISTER_LABEL[locale], url: register },
        ]}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
