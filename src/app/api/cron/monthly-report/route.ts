import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { monthlyReportEmail } from "@/lib/email-templates/monthly-report";
import fs from "fs";
import os from "os";
import path from "path";

const LOCK_FILE = path.join(os.tmpdir(), "cron-monthly-report.lock");
const LOCK_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

function acquireLock(): boolean {
  try {
    try {
      const stat = fs.statSync(LOCK_FILE);
      if (Date.now() - stat.mtimeMs > LOCK_MAX_AGE_MS) {
        fs.unlinkSync(LOCK_FILE);
      }
    } catch { /* lock doesn't exist */ }
    fs.writeFileSync(LOCK_FILE, String(process.pid), { flag: "wx" });
    return true;
  } catch {
    return false;
  }
}

function releaseLock() {
  try { fs.unlinkSync(LOCK_FILE); } catch { /* already removed */ }
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!acquireLock()) {
    return NextResponse.json({ error: "Already running" }, { status: 409 });
  }

  try {
    // Get all active users with subscriptions
    const users = await prisma.user.findMany({
      where: {
        onboardingCompleted: true,
        currentPlan: { not: "free" },
      },
      include: {
        matches: {
          include: { rule: true },
        },
      },
    });

    let sent = 0;

    for (const user of users) {
      const totalSavings = user.matches.reduce(
        (sum, m) => sum + (m.estimatedSaving ? Number(m.estimatedSaving) : 0),
        0
      );
      const completedActions = user.matches.filter((m) => m.status === "completed").length;
      const pendingActions = user.matches.filter((m) => m.status === "pending").length;

      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const upcomingDeadlines = user.matches
        .filter((m) => m.rule.deadline && new Date(m.rule.deadline) <= in30Days && new Date(m.rule.deadline) > now)
        .map((m) => ({
          name: m.rule.name,
          date: m.rule.deadline!.toLocaleDateString("it-IT"),
        }))
        .slice(0, 5);

      const html = monthlyReportEmail({
        name: user.name || undefined,
        totalSavings,
        newRules: 0,
        completedActions,
        pendingActions,
        upcomingDeadlines,
      });

      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: "Il tuo riepilogo mensile — RisparmiaMi",
          html,
        });
        sent++;
      }
    }

    return NextResponse.json({ sent });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  } finally {
    releaseLock();
  }
}
