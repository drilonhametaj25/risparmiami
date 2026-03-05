import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategoryMatches, getFreePlanLimit } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";

export const metadata: Metadata = { title: "Abbonamenti" };

export default async function AbbonamentiPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isFree = session.user.currentPlan === "free";
  const limit = isFree ? getFreePlanLimit() : undefined;
  const { matches, totalCount, totalSavings } = await getCategoryMatches(session.user.id, "abbonamenti", limit);

  return (
    <CategoryPageLayout
      title="Abbonamenti"
      description="Identifica e ottimizza i tuoi abbonamenti attivi"
      matches={matches}
      totalSavings={totalSavings}
    >
      {isFree && <UpgradeBanner totalMatches={totalCount} visibleMatches={matches.length} />}
    </CategoryPageLayout>
  );
}
