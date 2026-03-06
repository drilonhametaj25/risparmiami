import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata: Metadata = { title: "Impostazioni" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      notifyRuleUpdates: true,
      notifyMonthlyReport: true,
      notifyDeadlines: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="font-heading text-2xl mb-6">Impostazioni</h1>
      <SettingsForm user={{
        name: user.name || "",
        email: user.email,
        notifyRuleUpdates: user.notifyRuleUpdates,
        notifyMonthlyReport: user.notifyMonthlyReport,
        notifyDeadlines: user.notifyDeadlines,
      }} />
    </div>
  );
}
