import defaultMdxComponents from "fumadocs-ui/mdx";
import { Step, Steps } from "fumadocs-ui/components/steps";
import type { MDXComponents } from "mdx/types";

/** The components a guide's MDX can use: Fumadocs' callouts, cards and numbered steps. */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return { ...defaultMdxComponents, Step, Steps, ...components };
}
