import { notFound } from "next/navigation";

/** Any address no route answers renders the locale's not-found page. */
export default function CatchAllPage() {
  notFound();
}
