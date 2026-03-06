import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCategoryMatches } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";
import { BankCostTracker } from "@/components/dashboard/bank-cost-tracker";

export const metadata: Metadata = { title: "Banca" };

export default async function BancaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const isFree = session.user.currentPlan === "free";

  const [{ matches, totalSavings }, profile, bankExpenses] = await Promise.all([
    getCategoryMatches(session.user.id, "banca", isFree),
    prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { bankName: true, accountType: true, estimatedBankCost: true },
    }),
    prisma.userExpense.findMany({
      where: {
        userId: session.user.id,
        category: { in: ["bank_canone", "bank_commissioni", "bank_bollo", "bank_carta"] },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 4, // Get the most recent set of bank cost entries
    }),
  ]);

  // Extract latest values from expenses to pre-fill the form
  const getLatestAmount = (cat: string) => {
    const exp = bankExpenses.find((e) => e.category === cat);
    return exp ? Number(exp.amount) : 0;
  };

  const commissioniAnnue = getLatestAmount("bank_commissioni");

  const initialData = {
    bankName: profile?.bankName || "",
    accountType: profile?.accountType || "corrente",
    canoneAnnuo: getLatestAmount("bank_canone"),
    commissioniMedie: commissioniAnnue > 0 ? commissioniAnnue / 12 : 0,
    impostaBollo: getLatestAmount("bank_bollo") || 34.20,
    costoCarta: getLatestAmount("bank_carta"),
  };

  return (
    <CategoryPageLayout
      title="Banca"
      description="Riduci i costi del tuo conto corrente e servizi bancari"
      matches={matches}
      totalSavings={totalSavings}
    >
      <BankCostTracker initialData={initialData} />
    </CategoryPageLayout>
  );
}
