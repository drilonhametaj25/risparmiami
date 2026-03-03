import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/admin/stat-card";
import { CreditCard, Clock, TrendingUp, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAbbonamentiPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    subscriptionGroups,
    activeSubscriptions,
    canceledLast30,
    trialingCount,
  ] = await Promise.all([
    prisma.subscription.groupBy({
      by: ["plan", "status"],
      _count: { id: true },
    }),
    prisma.subscription.findMany({
      where: { status: { in: ["active", "trialing"] } },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        user: {
          select: { email: true, name: true, currentPlan: true },
        },
      },
    }),
    prisma.subscription.count({
      where: {
        status: "canceled",
        updatedAt: { gte: thirtyDaysAgo },
      },
    }),
    prisma.subscription.count({
      where: { status: "trialing" },
    }),
  ]);

  const activeCount = activeSubscriptions.filter(
    (s) => s.status === "active"
  ).length;

  const activePersonale = subscriptionGroups
    .filter((g) => g.plan === "personale" && (g.status === "active" || g.status === "trialing"))
    .reduce((sum, g) => sum + g._count.id, 0);
  const activeAzienda = subscriptionGroups
    .filter((g) => g.plan === "azienda" && (g.status === "active" || g.status === "trialing"))
    .reduce((sum, g) => sum + g._count.id, 0);
  const mrr = activePersonale * 4.99 + activeAzienda * 29;

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="certo">Attivo</Badge>
        );
      case "trialing":
        return (
          <Badge variant="probabile">In prova</Badge>
        );
      case "past_due":
        return (
          <span className="inline-flex items-center rounded-full bg-accent-danger/10 px-2.5 py-0.5 text-xs font-medium text-accent-danger">
            Scaduto
          </span>
        );
      case "canceled":
        return (
          <Badge variant="default">Cancellato</Badge>
        );
      default:
        return (
          <Badge variant="default">{status}</Badge>
        );
    }
  };

  const planBadgeVariant = (plan: string) => {
    switch (plan) {
      case "personale":
        return "probabile" as const;
      case "azienda":
        return "certo" as const;
      default:
        return "default" as const;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Abbonamenti</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Attivi"
          value={activeCount}
          icon={CreditCard}
          description={`${activePersonale} personale, ${activeAzienda} azienda`}
        />
        <StatCard
          label="In prova"
          value={trialingCount}
          icon={Clock}
          description="Abbonamenti trialing"
        />
        <StatCard
          label="MRR stimato"
          value={`€${mrr.toFixed(2)}`}
          icon={TrendingUp}
          description="Ricavo mensile ricorrente"
        />
        <StatCard
          label="Cancellati (30gg)"
          value={canceledLast30}
          icon={XCircle}
          description="Ultimi 30 giorni"
        />
      </div>

      <Card padding="md">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Abbonamenti Attivi
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted uppercase">
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Piano</th>
                <th className="pb-3 pr-4">Stato</th>
                <th className="pb-3 pr-4">Periodo fine</th>
                <th className="pb-3 pr-4">Cancella a fine periodo</th>
                <th className="pb-3">Aggiornato</th>
              </tr>
            </thead>
            <tbody>
              {activeSubscriptions.map((sub) => (
                <tr key={sub.id} className="border-b border-border-light">
                  <td className="py-2 pr-4 text-text-primary">
                    {sub.user?.email || "-"}
                  </td>
                  <td className="py-2 pr-4">
                    <Badge variant={planBadgeVariant(sub.plan)}>
                      {sub.plan}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4">{statusBadge(sub.status)}</td>
                  <td className="py-2 pr-4 text-text-secondary">
                    {sub.currentPeriodEnd
                      ? sub.currentPeriodEnd.toLocaleDateString("it-IT")
                      : "-"}
                  </td>
                  <td className="py-2 pr-4 text-center text-text-secondary">
                    {sub.cancelAtPeriodEnd ? (
                      <span className="text-accent-danger">Si</span>
                    ) : (
                      <span className="text-text-muted">No</span>
                    )}
                  </td>
                  <td className="py-2 text-text-secondary">
                    {sub.updatedAt.toLocaleDateString("it-IT")}
                  </td>
                </tr>
              ))}
              {activeSubscriptions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-text-muted"
                  >
                    Nessun abbonamento attivo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
