import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH - Update user settings (name + notification preferences)
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  }

  const body = await req.json();
  const { name, notifyRuleUpdates, notifyMonthlyReport, notifyDeadlines } = body;

  const data: Record<string, any> = {};
  if (typeof name === "string") data.name = name.trim();
  if (typeof notifyRuleUpdates === "boolean") data.notifyRuleUpdates = notifyRuleUpdates;
  if (typeof notifyMonthlyReport === "boolean") data.notifyMonthlyReport = notifyMonthlyReport;
  if (typeof notifyDeadlines === "boolean") data.notifyDeadlines = notifyDeadlines;

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });

  return NextResponse.json({ success: true });
}
