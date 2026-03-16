import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { topActionEmail } from "@/lib/email-templates/top-action";
import { savingsTipEmail } from "@/lib/email-templates/savings-tip";
import { trialEndingEmail } from "@/lib/email-templates/trial-ending";
import { newRulesEmail } from "@/lib/email-templates/new-rules";
import { reengagementEmail } from "@/lib/email-templates/reengagement";

const DRIP_SCHEDULE = [
  { step: 1, daysAfterSignup: 1, type: "top-action" },
  { step: 2, daysAfterSignup: 3, type: "savings-tip" },
  { step: 3, daysAfterSignup: 7, type: "trial-ending" },
  { step: 4, daysAfterSignup: 14, type: "new-rules" },
  { step: 5, daysAfterSignup: 45, type: "reengagement" },
];

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        onboardingCompleted: true,
        notifyRuleUpdates: true,
        email: { not: "" },
      },
      include: {
        matches: { include: { rule: true } },
      },
      take: 100,
    });

    let sent = 0;

    for (const user of users) {
      const daysSinceSignup = Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      // Find the next email to send
      const nextDrip = DRIP_SCHEDULE.find(
        (d) =>
          d.step > user.emailSequenceStep &&
          daysSinceSignup >= d.daysAfterSignup
      );

      if (!nextDrip) continue;

      // Don't send more than 1 email per day
      if (user.lastEmailSentAt) {
        const hoursSinceLastEmail =
          (Date.now() - new Date(user.lastEmailSentAt).getTime()) /
          (1000 * 60 * 60);
        if (hoursSinceLastEmail < 20) continue;
      }

      const totalSavings = user.matches.reduce(
        (s, m) => s + (m.estimatedSaving ? Number(m.estimatedSaving) : 0),
        0
      );
      const pendingActions = user.matches.filter(
        (m) => m.status === "pending"
      ).length;
      const completedActions = user.matches.filter(
        (m) => m.status === "completed"
      ).length;
      const topAction = user.matches.sort(
        (a, b) =>
          (Number(b.estimatedSaving) || 0) - (Number(a.estimatedSaving) || 0)
      )[0];

      let html = "";
      let subject = "";

      switch (nextDrip.type) {
        case "top-action":
          if (!topAction) continue;
          subject = `La tua opportunit\u00e0 #1: ${topAction.rule.name}`;
          html = topActionEmail({
            name: user.name || undefined,
            actionName: topAction.rule.name,
            actionCategory: topAction.rule.category,
            estimatedSaving: Number(topAction.estimatedSaving) || 0,
            totalSavings,
            totalActions: user.matches.length,
          });
          break;

        case "savings-tip":
          subject = "Lo sapevi? Un consiglio per risparmiare";
          html = savingsTipEmail({
            name: user.name || undefined,
            tipTitle: "Controlla sempre il mercato libero",
            tipContent:
              "Il 62% degli italiani paga troppo per luce e gas perch\u00e9 non confronta le offerte. Un semplice confronto pu\u00f2 farti risparmiare \u20ac100-300 all\u2019anno.",
            ctaText: "Vedi le tue opportunit\u00e0 bollette",
            ctaUrl: `${process.env.NEXTAUTH_URL}/dashboard/bollette`,
          });
          break;

        case "trial-ending":
          if (user.currentPlan !== "free") continue; // Already paid, skip
          subject = `Il tuo periodo di prova sta per scadere \u2014 \u20ac${totalSavings.toLocaleString("it-IT")} ti aspettano`;
          html = trialEndingEmail({
            name: user.name || undefined,
            totalSavings,
            totalActions: user.matches.length,
            completedActions,
          });
          break;

        case "new-rules": {
          const fourteenDaysAgo = new Date(
            Date.now() - 14 * 24 * 60 * 60 * 1000
          );
          const newRules = await prisma.rule.findMany({
            where: {
              isActive: true,
              createdAt: { gte: fourteenDaysAgo },
            },
            take: 5,
          });
          if (newRules.length === 0) {
            // No new rules, skip this step but mark as sent
            await prisma.user.update({
              where: { id: user.id },
              data: { emailSequenceStep: nextDrip.step },
            });
            continue;
          }
          subject = `${newRules.length} nuove opportunit\u00e0 aggiunte`;
          html = newRulesEmail({
            name: user.name || undefined,
            newRulesCount: newRules.length,
            topNewRules: newRules.map((r) => ({
              name: r.name,
              category: r.category,
              maxAmount: r.maxAmount ? Number(r.maxAmount) : null,
            })),
          });
          break;
        }

        case "reengagement":
          if (pendingActions === 0) continue;
          subject = `\u20ac${totalSavings.toLocaleString("it-IT")} di risparmi ti aspettano ancora`;
          html = reengagementEmail({
            name: user.name || undefined,
            totalSavings,
            pendingActions,
          });
          break;
      }

      if (html && user.email) {
        await sendEmail({ to: user.email, subject, html });
        await prisma.user.update({
          where: { id: user.id },
          data: {
            emailSequenceStep: nextDrip.step,
            lastEmailSent: nextDrip.type,
            lastEmailSentAt: new Date(),
          },
        });
        sent++;
      }
    }

    return NextResponse.json({ sent });
  } catch (error) {
    console.error("Email drip cron error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
