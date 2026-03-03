import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategoryMatches } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";

export const metadata: Metadata = { title: "Detrazioni Fiscali" };

export default async function DetrazioniPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const matches = await getCategoryMatches(session.user.id, "detrazioni");
  const total = matches.reduce((s, m) => s + m.estimatedSaving, 0);

  return (
    <CategoryPageLayout
      title="Detrazioni Fiscali"
      description="Tutte le detrazioni fiscali a cui hai diritto"
      matches={matches}
      totalSavings={total}
    />
  );
}
