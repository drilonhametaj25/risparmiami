import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/stat-card";
import { Users, CreditCard, TrendingUp, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersLast30,
    usersByPlan,
    activeSubscriptions,
    subscriptionsByPlan,
    pdfStats,
    activeRules,
    totalRules,
    lastUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.user.groupBy({
      by: ["currentPlan"],
      _count: { id: true },
    }),
    prisma.subscription.count({
      where: { status: { in: ["active", "trialing"] } },
    }),
    prisma.subscription.groupBy({
      by: ["plan"],
      where: { status: { in: ["active", "trialing"] } },
      _count: { id: true },
    }),
    prisma.pdfPurchase.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.rule.count({ where: { isActive: true } }),
    prisma.rule.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        currentPlan: true,
        createdAt: true,
      },
    }),
  ]);

  const personaleSubs = subscriptionsByPlan.find((s) => s.plan === "personale")?._count.id ?? 0;
  const aziendaSubs = subscriptionsByPlan.find((s) => s.plan === "azienda")?._count.id ?? 0;
  const mrr = personaleSubs * 4.99 + aziendaSubs * 29;

  const planBadgeVariant = (plan: string) => {
    switch (plan) {
      case "personale":
        return "probabile" as const;
      case "azienda":
        return "certo" as const;
      case "base":
        return "consiglio" as const;
      default:
        return "default" as const;
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-text-primary">Pannello Admin</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Utenti totali"
          value={totalUsers}
          icon={Users}
          description={`+${newUsersLast30} ultimi 30 giorni`}
        />
        <StatCard
          label="Abbonamenti attivi"
          value={activeSubscriptions}
          icon={CreditCard}
          description={`${personaleSubs} personale, ${aziendaSubs} azienda`}
        />
        <StatCard
          label="MRR stimato"
          value={`€${mrr.toFixed(2)}`}
          icon={TrendingUp}
          description="Ricavo mensile ricorrente"
        />
        <StatCard
          label="Regole attive"
          value={`${activeRules}/${totalRules}`}
          icon={BookOpen}
          description={`${pdfStats._count.id} PDF venduti (€${Number(pdfStats._sum.amount ?? 0).toFixed(2)})`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="md">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Ultimi utenti registrati
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted uppercase">
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Piano</th>
                  <th className="pb-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {lastUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border-light">
                    <td className="py-2 pr-4">{user.email}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={planBadgeVariant(user.currentPlan)}>
                        {user.currentPlan}
                      </Badge>
                    </td>
                    <td className="py-2">
                      {user.createdAt.toLocaleDateString("it-IT")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card padding="md">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            Utenti per piano
          </h2>
          <div className="space-y-3">
            {usersByPlan.map((group) => (
              <div
                key={group.currentPlan}
                className="flex items-center justify-between rounded-lg bg-bg-secondary p-3"
              >
                <span className="font-medium text-text-primary">
                  {group.currentPlan}
                </span>
                <span className="text-lg font-bold text-text-primary">
                  {group._count.id}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
