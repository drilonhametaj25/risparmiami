import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  name: z.string().trim().max(100, "Il nome non può superare i 100 caratteri").optional(),
  notifyRuleUpdates: z.boolean().optional(),
  notifyMonthlyReport: z.boolean().optional(),
  notifyDeadlines: z.boolean().optional(),
}).strict();

// PATCH - Update user settings (name + notification preferences)
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Dati non validi";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const data: Record<string, string | boolean> = {};
    if (parsed.data.name !== undefined) data.name = parsed.data.name;
    if (parsed.data.notifyRuleUpdates !== undefined) data.notifyRuleUpdates = parsed.data.notifyRuleUpdates;
    if (parsed.data.notifyMonthlyReport !== undefined) data.notifyMonthlyReport = parsed.data.notifyMonthlyReport;
    if (parsed.data.notifyDeadlines !== undefined) data.notifyDeadlines = parsed.data.notifyDeadlines;

    await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings PATCH error:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio delle impostazioni" },
      { status: 500 }
    );
  }
}
