// Dashboard module — server-only public surface: the organizer's Today page and
// its loader, which read the session cookie. Client code imports `index.ts`.
import "server-only";

export { TodayView } from "./today-view";
