import { prisma } from "@/lib/prisma";
import { evaluateAllRules } from "./evaluator";
import type { MatchResult, RuleWithRequirements, ProfileData } from "./types";

export type { MatchResult, CertaintyLevel, ProfileData } from "./types";

export async function computeMatchesForUser(userId: string): Promise<MatchResult[]> {
  // Fetch user profile
  const [userProfile, companyProfile] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.companyProfile.findUnique({ where: { userId } }),
  ]);

  if (!userProfile) return [];

  // Fetch all active rules with requirements
  const rules = await prisma.rule.findMany({
    where: { isActive: true },
    include: { requirements: true },
  }) as RuleWithRequirements[];

  // Build profile data object
  const profileData: ProfileData = {
    ...userProfile,
    ...(companyProfile ? companyProfile : {}),
  };

  // Evaluate personal rules
  const personalMatches = evaluateAllRules(rules, profileData, "persona");

  // Evaluate company rules if applicable
  let companyMatches: MatchResult[] = [];
  if (companyProfile) {
    companyMatches = evaluateAllRules(rules, profileData, "azienda");
  }

  const allMatches = [...personalMatches, ...companyMatches];

  // Upsert matches into database
  for (const match of allMatches) {
    await prisma.userMatch.upsert({
      where: {
        userId_ruleId: { userId, ruleId: match.ruleId },
      },
      create: {
        userId,
        ruleId: match.ruleId,
        estimatedSaving: match.estimatedSaving,
        certainty: match.certainty,
        matchScore: match.matchScore,
        status: "pending",
      },
      update: {
        estimatedSaving: match.estimatedSaving,
        certainty: match.certainty,
        matchScore: match.matchScore,
      },
    });
  }

  return allMatches;
}

export async function getMatchesForUser(userId: string) {
  return prisma.userMatch.findMany({
    where: { userId },
    include: { rule: true },
    orderBy: [
      { certainty: "asc" },
      { estimatedSaving: "desc" },
    ],
  });
}
