import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategoryMatches } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";

export const metadata: Metadata = { title: "Trasporti" };

export default async function TrasportiPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const matches = await getCategoryMatches(session.user.id, "trasporti");
  const total = matches.reduce((s, m) => s + m.estimatedSaving, 0);

  return (
    <CategoryPageLayout
      title="Trasporti"
      description="Risparmia su trasporti, viaggi e mobilit\u00E0"
      matches={matches}
      totalSavings={total}
    />
  );
}
