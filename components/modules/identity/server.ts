// Identity module — server-only public surface: loaders that read the session
// cookie. Server Components import these from here; client components use
// `index.ts`, which never pulls a cookie read into the browser bundle.
import "server-only";

export { getOrganizerContext, type OrganizerContext } from "./organizer-context";
export { OrganizerHome } from "./organizer-home";
