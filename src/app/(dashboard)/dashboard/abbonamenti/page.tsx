import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategoryMatches } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";

export const metadata: Metadata = { title: "Abbonamenti" };

export default async function AbbonamentiPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const matches = await getCategoryMatches(session.user.id, "abbonamenti");
  const total = matches.reduce((s, m) => s + m.estimatedSaving, 0);

  return (
    <CategoryPageLayout
      title="Abbonamenti"
      description="Identifica e ottimizza i tuoi abbonamenti attivi"
      matches={matches}
      totalSavings={total}
    />
  );
}
