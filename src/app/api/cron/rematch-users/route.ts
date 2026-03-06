import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeMatchesForUser } from "@/lib/rule-engine";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the most recent rule update
  const lastRuleUpdate = await prisma.rule.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
    select: { updatedAt: true },
  });

  if (!lastRuleUpdate) {
    return NextResponse.json({ message: "No active rules", rematched: 0 });
  }

  // Find users whose matches are stale (lastMatchedAt < last rule update)
  const staleUsers = await prisma.userProfile.findMany({
    where: {
      onboardingCompleted: true,
      OR: [
        { lastMatchedAt: null },
        { lastMatchedAt: { lt: lastRuleUpdate.updatedAt } },
      ],
    },
    select: { userId: true },
    take: 50, // Process in batches to avoid timeout
  });

  let rematched = 0;
  const errors: string[] = [];

  for (const { userId } of staleUsers) {
    try {
      await computeMatchesForUser(userId);
      rematched++;
    } catch (e) {
      errors.push(`User ${userId}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return NextResponse.json({
    rematched,
    staleUsersFound: staleUsers.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
