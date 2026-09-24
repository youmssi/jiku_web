import { useTranslations } from "next-intl";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { attendanceRegisterRoute } from "@/lib/constants";

/**
 * Downloadable proof of attendance (JIKU-95), often required before a funder or
 * an employer pays the balance of a session. The block appears only once
 * someone has checked in: an empty register before the event would look usable
 * and help no one.
 */
export function AttendanceDocuments({ eventId, checkedIn }: { eventId: string; checkedIn: number }) {
  const t = useTranslations("events.overview.attendance");
  if (checkedIn === 0) {
    return null;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description", { count: checkedIn })}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="outline">
          <a href={attendanceRegisterRoute(eventId)} download>
            <FileDown data-icon="inline-start" />
            {t("download")}
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
