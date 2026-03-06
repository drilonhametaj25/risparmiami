import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCategoryMatches } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";
import { SubscriptionTracker } from "@/components/dashboard/subscription-tracker";

export const metadata: Metadata = { title: "Abbonamenti" };

export default async function AbbonamentiPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isFree = session.user.currentPlan === "free";

  const [{ matches, totalSavings }, subscriptions] = await Promise.all([
    getCategoryMatches(session.user.id, "abbonamenti", isFree),
    prisma.userSubscription.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const serializedSubs = subscriptions.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    monthlyCost: Number(s.monthlyCost),
    isActive: s.isActive,
  }));

  return (
    <CategoryPageLayout
      title="Abbonamenti"
      description="Identifica e ottimizza i tuoi abbonamenti attivi"
      matches={matches}
      totalSavings={totalSavings}
    >
      <SubscriptionTracker initialSubscriptions={serializedSubs} />
    </CategoryPageLayout>
  );
}
