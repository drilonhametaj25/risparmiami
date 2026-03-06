import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const userId = session.user.id;

  const [user, profile, companyProfile, matches, subscriptions, expenses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, currentPlan: true, createdAt: true },
    }),
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.companyProfile.findUnique({ where: { userId } }),
    prisma.userMatch.findMany({ where: { userId }, include: { rule: { select: { name: true, category: true } } } }),
    prisma.userSubscription.findMany({ where: { userId } }),
    prisma.userExpense.findMany({ where: { userId } }),
  ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    user,
    profile,
    companyProfile,
    matches: matches.map(m => ({
      ruleName: m.rule.name,
      category: m.rule.category,
      estimatedSaving: m.estimatedSaving ? Number(m.estimatedSaving) : null,
      certainty: m.certainty,
      status: m.status,
      completedAt: m.completedAt,
    })),
    subscriptions: subscriptions.map(s => ({
      name: s.name,
      category: s.category,
      monthlyCost: Number(s.monthlyCost),
      isActive: s.isActive,
    })),
    expenses: expenses.map(e => ({
      category: e.category,
      amount: Number(e.amount),
      month: e.month,
      year: e.year,
      provider: e.provider,
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="risparmiami-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
