import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCategoryMatches, getFreePlanLimit } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { ExpenseTracker } from "@/components/dashboard/expense-tracker";

export const metadata: Metadata = { title: "Bollette" };

const BILL_CATEGORIES = [
  { value: "electricity", label: "Luce" },
  { value: "gas", label: "Gas" },
  { value: "water", label: "Acqua" },
  { value: "internet", label: "Internet" },
  { value: "phone", label: "Telefono" },
];

export default async function BollettePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isFree = session.user.currentPlan === "free";
  const limit = isFree ? getFreePlanLimit() : undefined;

  const [{ matches, totalCount, totalSavings }, expenses] = await Promise.all([
    getCategoryMatches(session.user.id, "bollette", limit),
    prisma.userExpense.findMany({
      where: {
        userId: session.user.id,
        category: { in: ["electricity", "gas", "water", "internet", "phone"] },
      },
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
      title="Bollette"
      description="Opportunità di risparmio su luce, gas e utenze"
      matches={matches}
      totalSavings={totalSavings}
    >
      <ExpenseTracker
        initialExpenses={serializedExpenses}
        categories={BILL_CATEGORIES}
        title="Le tue bollette"
      />
      {isFree && <UpgradeBanner totalMatches={totalCount} visibleMatches={matches.length} />}
    </CategoryPageLayout>
  );
}
