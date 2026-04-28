import type { Metadata } from "next";
import { AdminPageClient } from "@/components/admin-page-client";

export const metadata: Metadata = {
  title: "Admin Dashboard — BirthdayDrop",
  robots: { index: false, follow: false },
};

export default async function AdminPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <AdminPageClient eventId={eventId} />;
}
