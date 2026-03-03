import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/stat-card";
import { PdfUploadForm } from "@/components/admin/pdf-upload-form";
import { triggerPdfGeneration } from "@/app/(admin)/admin/actions";
import { ShoppingCart, DollarSign, Download } from "lucide-react";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export default async function AdminPdfPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const [purchases, purchaseStats, downloadStats] = await Promise.all([
    prisma.pdfPurchase.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    }),
    prisma.pdfPurchase.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.pdfPurchase.aggregate({
      _sum: { downloadCount: true },
    }),
  ]);

  let pdfExists = false;
  let pdfSizeKb = 0;
  let pdfLastModified: Date | null = null;

  const pdfPath = path.join(
    process.cwd(),
    "public",
    "generated-pdfs",
    "guida-risparmio-latest.pdf"
  );

  try {
    const stat = await fs.stat(pdfPath);
    pdfExists = true;
    pdfSizeKb = Math.round(stat.size / 1024);
    pdfLastModified = stat.mtime;
  } catch {
    // File does not exist
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text-primary">Gestione PDF</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Acquisti totali"
          value={purchaseStats._count.id}
          icon={ShoppingCart}
          description="PDF guida venduti"
        />
        <StatCard
          label="Ricavo totale"
          value={`€${Number(purchaseStats._sum.amount ?? 0).toFixed(2)}`}
          icon={DollarSign}
          description="Entrate da vendita PDF"
        />
        <StatCard
          label="Download totali"
          value={Number(downloadStats._sum.downloadCount ?? 0)}
          icon={Download}
          description="Download effettuati"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PdfUploadForm />

        <Card padding="md">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">
            PDF Corrente
          </h2>
          {pdfExists ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="certo">Presente</Badge>
              </div>
              <p className="text-sm text-text-secondary">
                Dimensione: <span className="font-medium">{pdfSizeKb} KB</span>
              </p>
              <p className="text-sm text-text-secondary">
                Ultima modifica:{" "}
                <span className="font-medium">
                  {pdfLastModified?.toLocaleDateString("it-IT")}{" "}
                  {pdfLastModified?.toLocaleTimeString("it-IT")}
                </span>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Badge variant="default">Non presente</Badge>
              <p className="text-sm text-text-muted">
                Nessun PDF generato. Carica un file o rigenera dal database.
              </p>
            </div>
          )}

          <div className="mt-4">
            <form action={triggerPdfGeneration}>
              <Button type="submit" variant="secondary">
                Rigenera dal DB
              </Button>
            </form>
          </div>
        </Card>
      </div>

      <Card padding="md">
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Storico Acquisti
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-text-muted uppercase">
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Importo</th>
                <th className="pb-3 pr-4">Downloads</th>
                <th className="pb-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="border-b border-border-light">
                  <td className="py-2 pr-4 text-text-primary">
                    {purchase.user?.email || purchase.email}
                  </td>
                  <td className="py-2 pr-4 text-text-secondary">
                    €{Number(purchase.amount).toFixed(2)}
                  </td>
                  <td className="py-2 pr-4 text-text-secondary">
                    {purchase.downloadCount}/{purchase.maxDownloads}
                  </td>
                  <td className="py-2 text-text-secondary">
                    {purchase.createdAt.toLocaleDateString("it-IT")}
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-text-muted"
                  >
                    Nessun acquisto registrato.
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
