import { prisma } from "@/lib/prisma";
import { evaluateAllRules } from "./evaluator";
import type { MatchResult, RuleWithRequirements, ProfileData } from "./types";

export type { MatchResult, CertaintyLevel, ProfileData } from "./types";

export async function computeMatchesForUser(userId: string): Promise<MatchResult[]> {
  // Fetch user profile + detailed data
  const [userProfile, companyProfile, subscriptions, expenses] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.companyProfile.findUnique({ where: { userId } }),
    prisma.userSubscription.findMany({ where: { userId, isActive: true } }),
    prisma.userExpense.findMany({ where: { userId } }),
  ]);

  if (!userProfile) return [];

  // Fetch all active rules with requirements
  const rules = await prisma.rule.findMany({
    where: { isActive: true },
    include: { requirements: true },
  }) as RuleWithRequirements[];

  // Compute aggregates from detailed data
  const totalSubscriptionCost = subscriptions.reduce((sum, s) => sum + Number(s.monthlyCost), 0);
  const subscriptionCountReal = subscriptions.length;
  const totalExpensesByCategory: Record<string, number> = {};
  for (const exp of expenses) {
    totalExpensesByCategory[exp.category] = (totalExpensesByCategory[exp.category] || 0) + Number(exp.amount);
  }

  // Update subscriptionCount in profile if user has entered real data
  if (subscriptionCountReal > 0) {
    const range = subscriptionCountReal <= 2 ? "0-2"
      : subscriptionCountReal <= 5 ? "3-5"
      : subscriptionCountReal <= 10 ? "6-10"
      : "10+";
    if (userProfile.subscriptionCount !== range) {
      await prisma.userProfile.update({
        where: { userId },
        data: { subscriptionCount: range },
      });
      userProfile.subscriptionCount = range;
    }
  }

  // Build profile data object with aggregates
  const profileData: ProfileData = {
    ...userProfile,
    ...(companyProfile ? companyProfile : {}),
    totalSubscriptionCost,
    subscriptionCountReal,
    totalElectricityCost: totalExpensesByCategory["electricity"] || 0,
    totalGasCost: totalExpensesByCategory["gas"] || 0,
    totalTransportCost: totalExpensesByCategory["transport"] || 0,
    totalSchoolCost: totalExpensesByCategory["school"] || 0,
    totalMedicalCost: totalExpensesByCategory["medical"] || 0,
  };

  // Evaluate personal rules
  const personalMatches = evaluateAllRules(rules, profileData, "persona");

  // Evaluate company rules if applicable
  let companyMatches: MatchResult[] = [];
  if (companyProfile) {
    companyMatches = evaluateAllRules(rules, profileData, "azienda");
  }

  const allMatches = [...personalMatches, ...companyMatches];
  const matchedRuleIds = allMatches.map((m) => m.ruleId);

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

  // Remove stale matches (rules that no longer match this user)
  await prisma.userMatch.deleteMany({
    where: {
      userId,
      ruleId: { notIn: matchedRuleIds },
    },
  });

  // Update lastMatchedAt
  await prisma.userProfile.update({
    where: { userId },
    data: { lastMatchedAt: new Date() },
  });

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
