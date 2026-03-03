import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Prisma } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function AdminUtentiPage({
  searchParams,
}: {
  searchParams: { q?: string; plan?: string; page?: string };
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const { q, plan, page: pageParam } = searchParams;
  const currentPage = Math.max(1, parseInt(pageParam || "1", 10));
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where: Prisma.UserWhereInput = {};

  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ];
  }

  if (plan) {
    where.currentPlan = plan;
  }

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        currentPlan: true,
        onboardingCompleted: true,
        createdAt: true,
        _count: {
          select: { matches: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const planBadgeVariant = (userPlan: string) => {
    switch (userPlan) {
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

  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (plan) params.set("plan", plan);
    params.set("page", String(newPage));
    return `/admin/utenti?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Gestione Utenti</h1>

      <Card padding="md">
        <form method="GET" action="/admin/utenti" className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="q" className="text-xs font-medium text-text-muted">
              Cerca per email o nome
            </label>
            <input
              id="q"
              name="q"
              type="text"
              defaultValue={q || ""}
              placeholder="Email o nome..."
              className="rounded-md border border-border-light bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="plan" className="text-xs font-medium text-text-muted">
              Piano
            </label>
            <select
              id="plan"
              name="plan"
              defaultValue={plan || ""}
              className="rounded-md border border-border-light bg-bg-primary px-3 py-2 text-sm text-text-primary focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="">Tutti i piani</option>
              <option value="base">Base</option>
              <option value="personale">Personale</option>
              <option value="azienda">Azienda</option>
            </select>
          </div>
          <Button variant="primary" type="submit">
            Filtra
          </Button>
          {(q || plan) && (
            <Link
              href="/admin/utenti"
              className="text-sm text-brand-primary hover:underline"
            >
              Reset filtri
            </Link>
          )}
        </form>
      </Card>

      <Card padding="md">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {totalCount} utent{totalCount === 1 ? "e" : "i"} trovat{totalCount === 1 ? "o" : "i"}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted uppercase">
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Nome</th>
                <th className="pb-3 pr-4">Piano</th>
                <th className="pb-3 pr-4">Onboarding</th>
                <th className="pb-3 pr-4">Matches</th>
                <th className="pb-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border-light">
                  <td className="py-3 pr-4">
                    <span className="font-medium text-text-primary">
                      {user.email}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">
                    {user.name || "-"}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={planBadgeVariant(user.currentPlan)}>
                      {user.currentPlan}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-center">
                    {user.onboardingCompleted ? (
                      <span className="text-accent-success" title="Completato">
                        &#10003;
                      </span>
                    ) : (
                      <span className="text-accent-danger" title="Non completato">
                        &#10007;
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-text-secondary">
                    {user._count.matches}
                  </td>
                  <td className="py-3 text-text-secondary">
                    {user.createdAt.toLocaleDateString("it-IT")}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-text-muted"
                  >
                    Nessun utente trovato.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Pagina {currentPage} di {totalPages}
            </p>
            <div className="flex gap-2">
              {currentPage > 1 && (
                <Link href={buildPageUrl(currentPage - 1)}>
                  <Button variant="secondary">Precedente</Button>
                </Link>
              )}
              {currentPage < totalPages && (
                <Link href={buildPageUrl(currentPage + 1)}>
                  <Button variant="secondary">Successiva</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
