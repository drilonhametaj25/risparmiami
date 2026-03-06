import { prisma } from "@/lib/prisma";

export async function getCategoryMatches(userId: string, category: string, isFree: boolean = false) {
  const matches = await prisma.userMatch.findMany({
    where: {
      userId,
      rule: { category },
    },
    include: { rule: true },
    orderBy: [{ certainty: "asc" }, { estimatedSaving: "desc" }],
  });

  const serialized = matches.map((m) => ({
    id: m.id,
    status: m.status,
    estimatedSaving: m.estimatedSaving ? Number(m.estimatedSaving) : 0,
    certainty: m.certainty,
    locked: isFree,
    rule: {
      name: m.rule.name,
      shortDescription: m.rule.shortDescription,
      fullDescription: isFree ? null : m.rule.fullDescription,
      howToClaim: isFree ? null : m.rule.howToClaim,
      requiredDocs: isFree ? [] : m.rule.requiredDocs,
      whereToApply: isFree ? null : m.rule.whereToApply,
      officialUrl: isFree ? null : m.rule.officialUrl,
      deadline: m.rule.deadline?.toISOString() || null,
    },
  }));

  return {
    matches: serialized,
    totalCount: serialized.length,
    totalSavings: serialized.reduce((s, m) => s + m.estimatedSaving, 0),
  };
}
