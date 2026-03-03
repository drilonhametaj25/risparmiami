import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ActionsList } from "@/components/dashboard/actions-list";

export const metadata: Metadata = {
  title: "Azioni",
};

export default async function ActionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const matches = await prisma.userMatch.findMany({
    where: { userId: session.user.id },
    include: {
      rule: {
        include: { requirements: true },
      },
    },
    orderBy: [
      { certainty: "asc" },
      { estimatedSaving: "desc" },
    ],
  });

  const serialized = matches.map((m) => ({
    id: m.id,
    ruleId: m.ruleId,
    status: m.status,
    estimatedSaving: m.estimatedSaving ? Number(m.estimatedSaving) : 0,
    certainty: m.certainty,
    completedAt: m.completedAt?.toISOString() || null,
    rule: {
      name: m.rule.name,
      shortDescription: m.rule.shortDescription,
      fullDescription: m.rule.fullDescription,
      category: m.rule.category,
      howToClaim: m.rule.howToClaim,
      requiredDocs: m.rule.requiredDocs,
      whereToApply: m.rule.whereToApply,
      deadline: m.rule.deadline?.toISOString() || null,
      officialUrl: m.rule.officialUrl,
    },
  }));

  return (
    <div>
      <h1 className="font-heading text-2xl mb-6">Le tue azioni</h1>
      <ActionsList actions={serialized} />
    </div>
  );
}
