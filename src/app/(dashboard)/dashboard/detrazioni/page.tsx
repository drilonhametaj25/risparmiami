import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCategoryMatches } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";
import { ExpenseTracker } from "@/components/dashboard/expense-tracker";

export const metadata: Metadata = { title: "Detrazioni Fiscali" };

const DEDUCTION_CATEGORIES = [
  { value: "school", label: "Scuola" },
  { value: "daycare", label: "Asilo nido" },
  { value: "medical", label: "Spese mediche" },
];

export default async function DetrazioniPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isFree = session.user.currentPlan === "free";

  const [{ matches, totalSavings }, expenses] = await Promise.all([
    getCategoryMatches(session.user.id, "detrazioni", isFree),
    prisma.userExpense.findMany({
      where: {
        userId: session.user.id,
        category: { in: ["school", "daycare", "medical"] },
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
      title="Detrazioni Fiscali"
      description="Tutte le detrazioni fiscali a cui hai diritto"
      matches={matches}
      totalSavings={totalSavings}
    >
      <ExpenseTracker
        initialExpenses={serializedExpenses}
        categories={DEDUCTION_CATEGORIES}
        title="Le tue spese detraibili"
        showProvider={false}
      />
    </CategoryPageLayout>
  );
}
