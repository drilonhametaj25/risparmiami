import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  toggleRuleActive,
  duplicateRule,
  deleteRule,
} from "@/app/(admin)/admin/actions";

export const dynamic = "force-dynamic";

const CATEGORIES: Record<string, string> = {
  "detrazioni-fiscali": "Detrazioni fiscali",
  "bonus-inps": "Bonus INPS",
  bollette: "Bollette",
  banca: "Banca",
  trasporti: "Trasporti",
  isee: "ISEE",
  "incentivi-imprese": "Incentivi imprese",
};

const TARGETS: Record<string, string> = {
  persona: "Persona",
  impresa: "Impresa",
  entrambi: "Entrambi",
};

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function RegolePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "";
  const status = params.status || "";
  const page = parseInt(params.page || "1", 10);
  const perPage = 20;

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = category;
  }

  if (status === "active") {
    where.isActive = true;
  } else if (status === "inactive") {
    where.isActive = false;
  }

  const [rules, total] = await Promise.all([
    prisma.rule.findMany({
      where,
      include: { _count: { select: { requirements: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.rule.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  function buildUrl(overrides: Record<string, string>) {
    const base: Record<string, string> = {};
    if (q) base.q = q;
    if (category) base.category = category;
    if (status) base.status = status;
    if (page > 1) base.page = String(page);
    const merged = { ...base, ...overrides };
    const search = new URLSearchParams(merged).toString();
    return `/admin/regole${search ? `?${search}` : ""}`;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl">Regole</h1>
        <Button asChild size="sm">
          <Link href="/admin/regole/nuova">Nuova regola</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <form method="GET" action="/admin/regole" className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="q" className="block text-sm font-medium text-text-primary mb-1">
              Cerca
            </label>
            <input
              type="text"
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Nome o descrizione..."
              className="w-full border border-border-light rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
            />
          </div>

          <div className="w-48">
            <label htmlFor="category" className="block text-sm font-medium text-text-primary mb-1">
              Categoria
            </label>
            <select
              id="category"
              name="category"
              defaultValue={category}
              className="w-full border border-border-light rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
            >
              <option value="">Tutte</option>
              {Object.entries(CATEGORIES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label htmlFor="status" className="block text-sm font-medium text-text-primary mb-1">
              Stato
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status}
              className="w-full border border-border-light rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
            >
              <option value="">Tutti</option>
              <option value="active">Attive</option>
              <option value="inactive">Inattive</option>
            </select>
          </div>

          <Button type="submit" variant="secondary" size="sm">
            Filtra
          </Button>
        </form>
      </Card>

      {/* Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left text-xs text-text-muted uppercase px-4 py-3">Nome</th>
                <th className="text-left text-xs text-text-muted uppercase px-4 py-3">Categoria</th>
                <th className="text-left text-xs text-text-muted uppercase px-4 py-3">Target</th>
                <th className="text-left text-xs text-text-muted uppercase px-4 py-3">Certezza</th>
                <th className="text-left text-xs text-text-muted uppercase px-4 py-3">Requisiti</th>
                <th className="text-left text-xs text-text-muted uppercase px-4 py-3">Attiva</th>
                <th className="text-left text-xs text-text-muted uppercase px-4 py-3">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {rules.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-text-muted">
                    Nessuna regola trovata.
                  </td>
                </tr>
              )}
              {rules.map((rule) => (
                <tr key={rule.id} className="border-b border-border-light">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/regole/${rule.id}/modifica`}
                      className="text-accent-primary hover:underline font-medium"
                    >
                      {rule.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge>{CATEGORIES[rule.category] || rule.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {TARGETS[rule.target] || rule.target}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={rule.certaintyLevel as "certo" | "probabile" | "consiglio"}>
                      {rule.certaintyLevel}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {rule._count.requirements}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        rule.isActive ? "bg-accent-success" : "bg-accent-danger"
                      }`}
                      title={rule.isActive ? "Attiva" : "Inattiva"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/regole/${rule.id}/modifica`}
                        className="text-xs text-accent-primary hover:underline"
                      >
                        Modifica
                      </Link>
                      <form action={duplicateRule.bind(null, rule.id)}>
                        <button
                          type="submit"
                          className="text-xs text-text-secondary hover:text-text-primary"
                        >
                          Duplica
                        </button>
                      </form>
                      <form action={toggleRuleActive.bind(null, rule.id)}>
                        <button
                          type="submit"
                          className="text-xs text-text-secondary hover:text-text-primary"
                        >
                          {rule.isActive ? "Disattiva" : "Attiva"}
                        </button>
                      </form>
                      <form action={deleteRule.bind(null, rule.id)}>
                        <button
                          type="submit"
                          className="text-xs text-accent-danger hover:text-accent-danger/80"
                        >
                          Elimina
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-text-muted">
            {total} regole totali &middot; Pagina {page} di {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Button asChild variant="secondary" size="sm">
                <Link href={buildUrl({ page: String(page - 1) })}>Precedente</Link>
              </Button>
            )}
            {page < totalPages && (
              <Button asChild variant="secondary" size="sm">
                <Link href={buildUrl({ page: String(page + 1) })}>Successiva</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
