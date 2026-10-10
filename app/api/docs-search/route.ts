import { createFromSource } from "fumadocs-core/search/server";
import { docsSource } from "@/components/modules/docs";

/** Search over the guides, per locale, for the docs' search dialog (JIKU-235). */
export const { GET } = createFromSource(docsSource, {
  localeMap: { fr: "french", en: "english" },
});
