import { redirect } from "next/navigation";
import { ADMIN_ROUTES } from "@/lib/constants";

export default function AdminIndexPage() {
  redirect(ADMIN_ROUTES.TENANTS);
}
