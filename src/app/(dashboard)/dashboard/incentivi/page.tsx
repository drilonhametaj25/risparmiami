import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategoryMatches } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";

export const metadata: Metadata = { title: "Incentivi Imprese" };

export default async function IncentiviPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Check that the user has an "azienda" plan
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentPlan: true },
  });

  if (user?.currentPlan !== "azienda") {
    redirect("/prezzi");
  }

  const matches = await getCategoryMatches(session.user.id, "incentivi");
  const total = matches.reduce((s, m) => s + m.estimatedSaving, 0);

  return (
    <CategoryPageLayout
      title="Incentivi Imprese"
      description="Crediti d'imposta, bandi e agevolazioni per la tua azienda"
      matches={matches}
      totalSavings={total}
    />
  );
}
