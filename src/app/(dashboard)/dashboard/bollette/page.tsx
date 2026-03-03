import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCategoryMatches } from "@/lib/dashboard-helpers";
import { CategoryPageLayout } from "@/components/dashboard/category-page-layout";

export const metadata: Metadata = { title: "Bollette" };

export default async function BollettePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const matches = await getCategoryMatches(session.user.id, "bollette");
  const total = matches.reduce((s, m) => s + m.estimatedSaving, 0);

  return (
    <CategoryPageLayout
      title="Bollette"
      description="Opportunit\u00E0 di risparmio su luce, gas e utenze"
      matches={matches}
      totalSavings={total}
    />
  );
}
