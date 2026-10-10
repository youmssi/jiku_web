import "server-only";

import { loader } from "fumadocs-core/source";
import { metaSchema, pageSchema } from "fumadocs-core/source/schema";
import { defineDocs } from "fumadocs-mdx/macro";
import { DOCS_ROUTE } from "@/lib/constants";
import { docsI18n } from "./docs-i18n";

const docs = defineDocs({
  dir: "content/docs",
  docs: { schema: pageSchema },
  meta: { schema: metaSchema },
});

/** Every guide, per locale, with its page tree for the sidebar (JIKU-235). */
export const docsSource = loader({
  baseUrl: DOCS_ROUTE,
  source: docs.toFumadocsSource(),
  i18n: docsI18n,
});
