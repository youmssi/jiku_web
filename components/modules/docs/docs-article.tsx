import { notFound } from "next/navigation";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { DOCS_OTHER_LANGUAGE } from "./docs-labels";
import { getMDXComponents } from "./mdx-components";
import { docsSource } from "./source";

/**
 * One guide: its title, lead and body, with a link to the same guide in the
 * other language. MDX links written as relative file paths resolve to the
 * guide they name.
 */
export function DocsArticle({ locale, slug }: { locale: Locale; slug: string[] | undefined }) {
  const page = docsSource.getPage(slug, locale);
  if (!page) notFound();
  const MDX = page.data.body;
  const other: Locale = locale === "fr" ? "en" : "fr";
  const path = page.url.replace(/^\/en(?=\/)/, "");

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="border-b pb-6">
        <Link
          href={path}
          locale={other}
          lang={other}
          aria-label={DOCS_OTHER_LANGUAGE[locale].ariaLabel}
          className="inline-flex min-h-9 items-center text-sm font-medium text-muted-foreground underline decoration-foreground/30 underline-offset-4 hover:text-foreground"
        >
          {DOCS_OTHER_LANGUAGE[locale].label}
        </Link>
      </div>
      <DocsBody>
        <MDX components={getMDXComponents({ a: createRelativeLink(docsSource, page) })} />
      </DocsBody>
    </DocsPage>
  );
}

/** Every guide's slug in every locale, for static generation. */
export function docsStaticParams() {
  return docsSource.generateParams("slug", "locale");
}

/** A guide's title and lead for its metadata, or null when it does not exist. */
export function docsPageMeta(locale: Locale, slug: string[] | undefined) {
  const page = docsSource.getPage(slug, locale);
  if (!page) return null;
  return { title: page.data.title, description: page.data.description ?? "", url: page.url };
}
