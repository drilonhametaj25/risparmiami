import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategoryMatches } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";

export const metadata: Metadata = { title: "Banca" };

export default async function BancaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const matches = await getCategoryMatches(session.user.id, "banca");
  const total = matches.reduce((s, m) => s + m.estimatedSaving, 0);

  return (
    <CategoryPageLayout
      title="Banca"
      description="Riduci i costi del tuo conto corrente e servizi bancari"
      matches={matches}
      totalSavings={total}
    />
  );
}
