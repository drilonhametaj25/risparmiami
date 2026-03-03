import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  demoteAdmin,
  promoteToAdmin,
  triggerPdfGeneration,
  triggerMonthlyReport,
} from "@/app/(admin)/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminImpostazioniPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const [admins, scraperLogs] = await Promise.all([
    prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true, email: true, name: true },
      orderBy: { email: "asc" },
    }),
    prisma.scraperLog.findMany({
      orderBy: { runAt: "desc" },
      take: 10,
    }),
  ]);

  const statusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="certo">Successo</Badge>;
      case "partial":
        return <Badge variant="probabile">Parziale</Badge>;
      case "error":
        return (
          <span className="inline-flex items-center rounded-full bg-accent-danger/10 px-2.5 py-0.5 text-xs font-medium text-accent-danger">
            Errore
          </span>
        );
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-text-primary">Impostazioni</h1>

      {/* Gestione Amministratori */}
      <Card padding="md">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Gestione Amministratori
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted uppercase">
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Nome</th>
                <th className="pb-3">Azione</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-border-light">
                  <td className="py-2 pr-4 text-text-primary">
                    {admin.email}
                  </td>
                  <td className="py-2 pr-4 text-text-secondary">
                    {admin.name || "-"}
                  </td>
                  <td className="py-2">
                    {admin.id !== session.user.id ? (
                      <form action={demoteAdmin.bind(null, admin.id)}>
                        <Button type="submit" variant="danger">
                          Rimuovi
                        </Button>
                      </form>
                    ) : (
                      <span className="text-xs text-text-muted">(tu)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 border-t border-border-light pt-4">
          <h3 className="mb-3 text-sm font-medium text-text-primary">
            Promuovi utente ad amministratore
          </h3>
          <form
            action={promoteToAdmin}
            className="flex items-end gap-3"
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-xs font-medium text-text-muted"
              >
                Email utente
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="utente@email.com"
                className="rounded-md border border-border-light bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>
            <Button type="submit" variant="primary">
              Promuovi
            </Button>
          </form>
        </div>
      </Card>

      {/* Cron Jobs */}
      <Card padding="md">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Cron Jobs
        </h2>
        <div className="flex flex-wrap gap-3">
          <form action={triggerPdfGeneration}>
            <Button type="submit" variant="secondary">
              Rigenera PDF Guida
            </Button>
          </form>
          <form action={triggerMonthlyReport}>
            <Button type="submit" variant="secondary">
              Invia Report Mensile
            </Button>
          </form>
        </div>
      </Card>

      {/* Scraper Logs */}
      <Card padding="md">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Scraper Logs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted uppercase">
                <th className="pb-3 pr-4">Source</th>
                <th className="pb-3 pr-4">Stato</th>
                <th className="pb-3 pr-4">Regole trovate</th>
                <th className="pb-3 pr-4">Nuove</th>
                <th className="pb-3 pr-4">Aggiornate</th>
                <th className="pb-3 pr-4">Durata</th>
                <th className="pb-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {scraperLogs.map((log) => (
                <tr key={log.id} className="border-b border-border-light">
                  <td className="py-2 pr-4 font-medium text-text-primary">
                    {log.source}
                  </td>
                  <td className="py-2 pr-4">{statusBadge(log.status)}</td>
                  <td className="py-2 pr-4 text-text-secondary">
                    {log.rulesFound}
                  </td>
                  <td className="py-2 pr-4 text-text-secondary">
                    {log.rulesNew}
                  </td>
                  <td className="py-2 pr-4 text-text-secondary">
                    {log.rulesUpdated}
                  </td>
                  <td className="py-2 pr-4 text-text-secondary">
                    {log.duration ? `${log.duration}ms` : "-"}
                  </td>
                  <td className="py-2 text-text-secondary">
                    {log.runAt.toLocaleDateString("it-IT")}
                  </td>
                </tr>
              ))}
              {scraperLogs.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-text-muted"
                  >
                    Nessun log disponibile.
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
