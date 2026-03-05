import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SavingsOverview } from "@/components/dashboard/savings-overview";
import { CertaintyBreakdown } from "@/components/dashboard/certainty-breakdown";
import { PriorityActions } from "@/components/dashboard/priority-actions";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";

export const metadata: Metadata = {
  title: "Dashboard",
};

const FREE_PRIORITY_LIMIT = 3;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isFree = session.user.currentPlan === "free";

  const matches = await prisma.userMatch.findMany({
    where: { userId: session.user.id },
    include: { rule: true },
    orderBy: { estimatedSaving: "desc" },
  });

  // Aggregate data
  const totalSavings = matches.reduce((sum, m) => sum + (m.estimatedSaving ? Number(m.estimatedSaving) : 0), 0);
  const completedSavings = matches
    .filter((m) => m.status === "completed")
    .reduce((sum, m) => sum + (m.estimatedSaving ? Number(m.estimatedSaving) : 0), 0);

  const certainCounts = {
    certo: matches.filter((m) => m.certainty === "certo"),
    probabile: matches.filter((m) => m.certainty === "probabile"),
    consiglio: matches.filter((m) => m.certainty === "consiglio"),
  };

  const categoryTotals = matches.reduce((acc, m) => {
    const cat = m.rule.category;
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += m.estimatedSaving ? Number(m.estimatedSaving) : 0;
    return acc;
  }, {} as Record<string, number>);

  const pendingMatches = matches.filter((m) => m.status === "pending");
  const priorityLimit = isFree ? FREE_PRIORITY_LIMIT : 5;
  const priorityMatches = pendingMatches
    .slice(0, priorityLimit)
    .map((m) => ({
      id: m.id,
      ruleId: m.ruleId,
      ruleName: m.rule.name,
      ruleCategory: m.rule.category,
      estimatedSaving: m.estimatedSaving ? Number(m.estimatedSaving) : 0,
      certainty: m.certainty,
      deadline: m.rule.deadline?.toISOString() || null,
    }));

  return (
    <div>
      <h1 className="font-heading text-2xl mb-6">La tua panoramica</h1>

      <div className="space-y-6">
        <SavingsOverview
          totalSavings={totalSavings}
          completedSavings={completedSavings}
          matchCount={matches.length}
        />

        <CertaintyBreakdown
          certo={{ count: certainCounts.certo.length, total: certainCounts.certo.reduce((s, m) => s + (m.estimatedSaving ? Number(m.estimatedSaving) : 0), 0) }}
          probabile={{ count: certainCounts.probabile.length, total: certainCounts.probabile.reduce((s, m) => s + (m.estimatedSaving ? Number(m.estimatedSaving) : 0), 0) }}
          consiglio={{ count: certainCounts.consiglio.length, total: certainCounts.consiglio.reduce((s, m) => s + (m.estimatedSaving ? Number(m.estimatedSaving) : 0), 0) }}
        />

        <div className="grid lg:grid-cols-2 gap-6">
          <PriorityActions actions={priorityMatches} />
          <CategoryChart categories={categoryTotals} />
        </div>

        {isFree && (
          <UpgradeBanner
            totalMatches={pendingMatches.length}
            visibleMatches={priorityLimit}
          />
        )}
      </div>
    </div>
  );
}
