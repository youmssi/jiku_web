import { AdminPage, FeedbackInbox } from "@/components/modules/admin";
import { loadFeedback, loadRatingSummary } from "@/components/modules/admin/server";

export default async function AdminFeedbackPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ kind?: string; status?: string }> }>) {
  const { kind, status } = await searchParams;
  const [page, ratings] = await Promise.all([loadFeedback(kind, status), loadRatingSummary()]);
  return (
    <AdminPage title="Feedback">
      <FeedbackInbox page={page} ratings={ratings} kind={kind} status={status} />
    </AdminPage>
  );
}
