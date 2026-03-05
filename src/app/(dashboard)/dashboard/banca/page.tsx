import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategoryMatches, getFreePlanLimit } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";

export const metadata: Metadata = { title: "Banca" };

export default async function BancaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isFree = session.user.currentPlan === "free";
  const limit = isFree ? getFreePlanLimit() : undefined;
  const { matches, totalCount, totalSavings } = await getCategoryMatches(session.user.id, "banca", limit);

  return (
    <CategoryPageLayout
      title="Banca"
      description="Riduci i costi del tuo conto corrente e servizi bancari"
      matches={matches}
      totalSavings={totalSavings}
    >
      {isFree && <UpgradeBanner totalMatches={totalCount} visibleMatches={matches.length} />}
    </CategoryPageLayout>
  );
}
