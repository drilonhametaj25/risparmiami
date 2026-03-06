import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DeadlineCalendar } from "@/components/dashboard/deadline-calendar";

export const metadata: Metadata = {
  title: "Scadenze",
};

export default async function ScadenzePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const matches = await prisma.userMatch.findMany({
    where: {
      userId: session.user.id,
      status: "pending",
      rule: { deadline: { not: null } },
    },
    include: {
      rule: {
        select: {
          name: true,
          category: true,
          shortDescription: true,
          deadline: true,
          officialUrl: true,
        },
      },
    },
    orderBy: { rule: { deadline: "asc" } },
  });

  const deadlines = matches.map((m) => ({
    id: m.id,
    name: m.rule.name,
    category: m.rule.category,
    description: m.rule.shortDescription,
    deadline: m.rule.deadline!.toISOString(),
    officialUrl: m.rule.officialUrl,
    estimatedSaving: m.estimatedSaving ? Number(m.estimatedSaving) : 0,
  }));

  return (
    <div>
      <h1 className="font-heading text-2xl mb-1">Scadenze</h1>
      <p className="text-text-secondary text-sm mb-6">
        Le scadenze delle tue opportunità di risparmio
      </p>
      <DeadlineCalendar deadlines={deadlines} />
    </div>
  );
}
