import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCategoryMatches, getFreePlanLimit } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { ExpenseTracker } from "@/components/dashboard/expense-tracker";

export const metadata: Metadata = { title: "Trasporti" };

const TRANSPORT_CATEGORIES = [
  { value: "transport", label: "Trasporto" },
];

export default async function TrasportiPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isFree = session.user.currentPlan === "free";
  const limit = isFree ? getFreePlanLimit() : undefined;

  const [{ matches, totalCount, totalSavings }, expenses] = await Promise.all([
    getCategoryMatches(session.user.id, "trasporti", limit),
    prisma.userExpense.findMany({
      where: { userId: session.user.id, category: "transport" },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
  ]);

  const serializedExpenses = expenses.map((e) => ({
    id: e.id,
    category: e.category,
    description: e.description,
    month: e.month,
    year: e.year,
    amount: Number(e.amount),
    provider: e.provider,
  }));

  return (
    <CategoryPageLayout
      title="Trasporti"
      description="Risparmia su trasporti, viaggi e mobilità"
      matches={matches}
      totalSavings={totalSavings}
    >
      <ExpenseTracker
        initialExpenses={serializedExpenses}
        categories={TRANSPORT_CATEGORIES}
        title="Le tue spese di trasporto"
        showProvider={false}
      />
      {isFree && <UpgradeBanner totalMatches={totalCount} visibleMatches={matches.length} />}
    </CategoryPageLayout>
  );
}
