import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCategoryMatches } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";
import { IseeEstimator } from "@/components/dashboard/isee-estimator";

export const metadata: Metadata = { title: "ISEE e Bonus" };

export default async function IseePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isFree = session.user.currentPlan === "free";

  const [{ matches, totalSavings }, profile] = await Promise.all([
    getCategoryMatches(session.user.id, "isee", isFree),
    prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { iseeRange: true },
    }),
  ]);

  return (
    <CategoryPageLayout
      title="ISEE e Bonus"
      description="Bonus e agevolazioni basati su ISEE"
      matches={matches}
      totalSavings={totalSavings}
    >
      <IseeEstimator initialIseeRange={profile?.iseeRange || ""} />
    </CategoryPageLayout>
  );
}
