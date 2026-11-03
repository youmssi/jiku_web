// The landing module's narrow entry for the site's 404 (JIKU-287). The 404 is
// rendered inside every layout, so importing it through the module's barrel
// would ship the whole marketing site's client components (motion effects,
// navigation) to every page, guest cards included.
export { NotFoundPage } from "./not-found-page";
