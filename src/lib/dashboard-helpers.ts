import { prisma } from "@/lib/prisma";

const FREE_MATCH_LIMIT = 3;

export async function getCategoryMatches(userId: string, category: string, limit?: number) {
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

  return {
    matches: limit ? serialized.slice(0, limit) : serialized,
    totalCount: serialized.length,
    totalSavings: serialized.reduce((s, m) => s + m.estimatedSaving, 0),
  };
}

export function getFreePlanLimit() {
  return FREE_MATCH_LIMIT;
}
