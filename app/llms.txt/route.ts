import {
  BIRTHDAY_CARD_CONTENT,
  BIRTHDAY_TEXTS_CONTENT,
  LANDING_CONTENT,
  SIMULATOR_CONTENT,
  USE_CASES_CONTENT,
} from "@/components/modules/landing";
import { siteUrl } from "@/components/modules/seo";
import { LEGAL_NOTICE_ROUTE, PRIVACY_ROUTE, SEO_ROUTES, TERMS_ROUTE } from "@/lib/constants";

/**
 * /llms.txt (llmstxt.org): a plain summary of Jikū with its key pages and FAQ,
 * for AI assistants that answer questions about it (JIKU-219). Written from
 * the same content as the site, in French then English, so it never drifts.
 */
export function GET(): Response {
  const origin = siteUrl();
  const fr = LANDING_CONTENT.fr;
  const en = LANDING_CONTENT.en;
  const link = (title: string, path: string, note: string) => `- [${title}](${origin}${path}): ${note}`;

  const body = [
    "# Jikū",
    "",
    `> ${fr.meta.description}`,
    "",
    `> ${en.meta.description}`,
    "",
    "## Pages (français)",
    "",
    link(fr.meta.title, "/", fr.meta.description),
    link(USE_CASES_CONTENT.fr.meta.title, SEO_ROUTES.USE_CASES, USE_CASES_CONTENT.fr.meta.description),
    link(SIMULATOR_CONTENT.fr.meta.title, SEO_ROUTES.SIMULATOR, SIMULATOR_CONTENT.fr.meta.description),
    link(BIRTHDAY_CARD_CONTENT.fr.meta.title, SEO_ROUTES.BIRTHDAY_CARD, BIRTHDAY_CARD_CONTENT.fr.meta.description),
    link(BIRTHDAY_TEXTS_CONTENT.fr.meta.title, SEO_ROUTES.BIRTHDAY_TEXTS, BIRTHDAY_TEXTS_CONTENT.fr.meta.description),
    link(fr.faq.page.title, SEO_ROUTES.FAQ, fr.faq.page.description),
    "",
    "## Pages (English)",
    "",
    link(en.meta.title, "/en", en.meta.description),
    link(USE_CASES_CONTENT.en.meta.title, `/en${SEO_ROUTES.USE_CASES}`, USE_CASES_CONTENT.en.meta.description),
    link(SIMULATOR_CONTENT.en.meta.title, `/en${SEO_ROUTES.SIMULATOR}`, SIMULATOR_CONTENT.en.meta.description),
    link(BIRTHDAY_CARD_CONTENT.en.meta.title, `/en${SEO_ROUTES.BIRTHDAY_CARD}`, BIRTHDAY_CARD_CONTENT.en.meta.description),
    link(BIRTHDAY_TEXTS_CONTENT.en.meta.title, `/en${SEO_ROUTES.BIRTHDAY_TEXTS}`, BIRTHDAY_TEXTS_CONTENT.en.meta.description),
    link(en.faq.page.title, `/en${SEO_ROUTES.FAQ}`, en.faq.page.description),
    "",
    "## FAQ",
    "",
    ...fr.faq.items.flatMap((item) => [`### ${item.question}`, "", item.answer, ""]),
    ...en.faq.items.flatMap((item) => [`### ${item.question}`, "", item.answer, ""]),
    "## Optional",
    "",
    `- [Mentions légales](${origin}${LEGAL_NOTICE_ROUTE})`,
    `- [Conditions générales](${origin}${TERMS_ROUTE})`,
    `- [Politique de confidentialité](${origin}${PRIVACY_ROUTE})`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
