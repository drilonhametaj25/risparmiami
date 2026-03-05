import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategoryMatches, getFreePlanLimit } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";

export const metadata: Metadata = { title: "ISEE e Bonus" };

export default async function IseePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isFree = session.user.currentPlan === "free";
  const limit = isFree ? getFreePlanLimit() : undefined;
  const { matches, totalCount, totalSavings } = await getCategoryMatches(session.user.id, "isee", limit);

  return (
    <CategoryPageLayout
      title="ISEE e Bonus"
      description="Bonus e agevolazioni basati su ISEE"
      matches={matches}
      totalSavings={totalSavings}
    >
      {isFree && <UpgradeBanner totalMatches={totalCount} visibleMatches={matches.length} />}
    </CategoryPageLayout>
  );
}
