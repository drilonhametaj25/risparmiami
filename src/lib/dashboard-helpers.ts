import { prisma } from "@/lib/prisma";

export async function getCategoryMatches(userId: string, category: string) {
  const matches = await prisma.userMatch.findMany({
    where: {
      userId,
      rule: { category },
    },
    include: { rule: true },
    orderBy: [{ certainty: "asc" }, { estimatedSaving: "desc" }],
  });

  return matches.map((m) => ({
    id: m.id,
    status: m.status,
    estimatedSaving: m.estimatedSaving ? Number(m.estimatedSaving) : 0,
    certainty: m.certainty,
    rule: {
      name: m.rule.name,
      shortDescription: m.rule.shortDescription,
      fullDescription: m.rule.fullDescription,
      howToClaim: m.rule.howToClaim,
      requiredDocs: m.rule.requiredDocs,
      whereToApply: m.rule.whereToApply,
      officialUrl: m.rule.officialUrl,
      deadline: m.rule.deadline?.toISOString() || null,
    },
  }));
}
